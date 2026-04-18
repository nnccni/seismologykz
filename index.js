import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

const app = express();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// простая авторизация по токену
function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Нет токена" });
  // здесь можно добавить проверку токена
  next();
}

// получить все события в хронологическом порядке
app.get("/api/earthquakes", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM earthquakes ORDER BY date DESC, time DESC"
  );
  res.json(result.rows);
});

// добавить событие
app.post("/api/add", auth, async (req, res) => {
  const { date, time, lat, lon, magnitude, comment } = req.body;
  await pool.query(
    "INSERT INTO earthquakes (date, time, lat, lon, magnitude, comment) VALUES ($1,$2,$3,$4,$5,$6)",
    [date, time, lat, lon, magnitude, comment]
  );
  res.json({ ok: true });
});

// удалить событие
app.post("/api/delete", auth, async (req, res) => {
  const { id } = req.body;
  await pool.query("DELETE FROM earthquakes WHERE id=$1", [Number(id)]);
  res.json({ ok: true });
});

// обновить событие
app.post("/api/update", auth, async (req, res) => {
  const { id, date, time, lat, lon, magnitude, comment } = req.body;
  await pool.query(
    "UPDATE earthquakes SET date=$2, time=$3, lat=$4, lon=$5, magnitude=$6, comment=$7 WHERE id=$1",
    [Number(id), date, time, lat, lon, magnitude, comment]
  );
  res.json({ ok: true });
});

// запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
