require("dotenv").config();
const pool = require("./db");

(async () => {
  const [ids] = await pool.query("SELECT DISTINCT L_ListingID FROM rets_openhouse");
  console.log(`Testing ${ids.length} listing IDs...`);

  for (const { L_ListingID } of ids) {
    const url = `http://localhost:5000/api/properties/${encodeURIComponent(L_ListingID)}/openhouses`;
    const res = await fetch(url);
    // 200 and 404 are expected. Anything else is worth a look.
    if (res.status !== 200 && res.status !== 404) {
      console.log(res.status, JSON.stringify(L_ListingID));
    }
  }

  console.log("Done");
  await pool.end();
})();