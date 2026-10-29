const express = require("express");
const pool = require("../db");
const router = express.Router();

function parseInteger(value, { min, max } = {}) {
  if (value === undefined) return undefined;
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  if (min !== undefined && n < min) return null;
  if (max !== undefined && n > max) return null;
  return n;
}

function isValidListingId(id) {
  return /^[A-Za-z0-9_-]{1,50}$/.test(id);
}

router.get("/", async (req, res) => {
  try {
    const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;

    const limit = parseInteger(req.query.limit, { min: 1, max: 100 });
    const offset = parseInteger(req.query.offset, { min: 0 });
    const minP = parseInteger(minPrice, { min: 0 });
    const maxP = parseInteger(maxPrice, { min: 0 });
    const bedsN = parseInteger(beds, { min: 0 });
    const bathsN = parseInteger(baths, { min: 0 });

    const errors = [];
    if (limit === null) errors.push("limit must be an integer between 1 and 100");
    if (offset === null) errors.push("offset must be an integer 0 or greater");
    if (minP === null) errors.push("minPrice must be a non-negative integer");
    if (maxP === null) errors.push("maxPrice must be a non-negative integer");
    if (bedsN === null) errors.push("beds must be a non-negative integer");
    if (bathsN === null) errors.push("baths must be a non-negative integer");
    if (minP !== undefined && maxP !== undefined && minP > maxP)
      errors.push("minPrice cannot be greater than maxPrice");
    if (zipcode !== undefined && !/^\d{5}$/.test(zipcode))
      errors.push("zipcode must be a 5-digit number");
    if (city !== undefined && (typeof city !== "string" || city.trim() === ""))
      errors.push("city must be a non-empty string");

    if (errors.length > 0) {
      return res.status(400).json({ error: "Invalid query parameters", details: errors });
    }

    const conditions = [];
    const values = [];

    if (city !== undefined) {
      conditions.push("LOWER(TRIM(L_City)) = ?");
      values.push(city.trim().toLowerCase());
    }
    if (zipcode !== undefined) {
      conditions.push("L_Zip = ?");
      values.push(zipcode);
    }
    if (minP !== undefined) {
      conditions.push("L_SystemPrice >= ?");
      values.push(minP);
    }
    if (maxP !== undefined) {
      conditions.push("L_SystemPrice <= ?");
      values.push(maxP);
    }
    if (bedsN !== undefined) {
      conditions.push("L_Keyword2 >= ?");
      values.push(bedsN);
    }
    if (bathsN !== undefined) {
      conditions.push("LM_Dec_3 >= ?");
      values.push(bathsN);
    }

    const whereClause = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

   
    const finalLimit = limit ?? 20;
    const finalOffset = offset ?? 0;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM rets_property ${whereClause}`,
      values
    );

    const [rows] = await pool.query(
      `SELECT id, L_ListingID, L_Address, L_City, L_State, L_Zip,
              L_SystemPrice, L_Keyword2 AS beds, LM_Dec_3 AS baths,
              LotSizeSquareFeet AS sqft, L_Photos
      FROM rets_property ${whereClause} ORDER BY id LIMIT ? OFFSET ?`,
      [...values, finalLimit, finalOffset]
    );

    res.json({
      total: countRows[0].total,
      limit: finalLimit,
      offset: finalOffset,
      results: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/openhouses", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidListingId(id)) {
        return res.status(400).json({
            error: "Invalid listing ID. Use 1-50 letters, numbers, dashes, or underscores.",
        });
    }

    const [props] = await pool.query(
      "SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?",
      [id]
    );
    if (props.length === 0) {
      return res.status(404).json({ error: `Property ${id} not found` });
    }

    const [events] = await pool.query(
      "SELECT * FROM rets_openhouse WHERE L_ListingID = ? ORDER BY OpenHouseDate, OH_StartTime",
      [id]
    );

    res.json(events);
  } catch (err) {
    console.error("Open houses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidListingId(id)) {
        return res.status(400).json({
            error: "Invalid listing ID. Use 1-50 letters, numbers, dashes, or underscores.",
        });
    }

    const [rows] = await pool.query(
      "SELECT * FROM rets_property WHERE L_ListingID = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `Property ${id} not found` });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Property detail error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;