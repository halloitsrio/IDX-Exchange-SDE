require("dotenv").config();
const pool = require("./db");

async function check(label, qs, sql, params) {
  const res = await fetch(`http://localhost:5000/api/properties?${qs}`);
  const body = await res.json();
  const [[{ n }]] = await pool.query(sql, params);
  const pass = body.total === n;
  console.log(`${pass ? "PASS" : "FAIL"} ${label}: api=${body.total}, db=${n}`);
}

(async () => {
  await check("minPrice only", "minPrice=300000",
    "SELECT COUNT(*) n FROM rets_property WHERE list_price >= ?", [300000]);
  await check("beds only", "beds=3",
    "SELECT COUNT(*) n FROM rets_property WHERE beds >= ?", [3]);
  await check("minPrice + beds", "minPrice=300000&beds=3",
    "SELECT COUNT(*) n FROM rets_property WHERE list_price >= ? AND beds >= ?", [300000, 3]);
  await pool.end();
})();