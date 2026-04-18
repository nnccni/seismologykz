import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const SECRET = "supersecretjwtkey123";

// Railway автоматически задаёт DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// создаём таблицу при старте (если нет)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS earthquakes (
      id BIGINT PRIMARY KEY,
      date TEXT,
      time TEXT,
      lat REAL,
      lon REAL,
      magnitude REAL,
      comment TEXT
    )
  `);
}
initDB();

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false, error: "Нет токена" });
  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Неверный токен" });
  }
}

app.post("/auth", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ user: username }, SECRET, { expiresIn: "1h" });
    res.json({ ok: true, token });
  } else {
    res.status(401).json({ ok: false, error: "Неверный логин или пароль" });
  }
});

app.get("/", (req, res) => res.sendFile("public/login.html", { root: process.cwd() }));
app.get("/cabinet", (req, res) => res.sendFile("public/list.html", { root: process.cwd() }));
app.get("/public", (req, res) => res.sendFile("public/public.html", { root: process.cwd() }));

// получить все события
// получить все события в хронологическом порядке
app.get("/api/earthquakes", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM earthquakes ORDER BY date DESC, time DESC"
app.get("/api/earthquakes", async (req, res) => {

// добавить событие
app.post("/api/add", auth, async (req, res) => {
  const record = { id: Date.now(), ...req.body };
  const { date, time, lat, lon, magnitude, comment } = req.body;
  await pool.query(
    "INSERT INTO earthquakes (id, date, time, lat, lon, magnitude, comment) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [record.id, record.date, record.time, record.lat, record.lon, record.magnitude, record.comment]
    "INSERT INTO earthquakes (date, time, lat, lon, magnitude, comment) VALUES ($1,$2,$3,$4,$5,$6)",
    [date, time, lat, lon, magnitude, comment]
  );
  res.json({ ok: true, record });
  res.json({ ok: true });
});

// удалить событие
app.post("/api/delete", auth, async (req, res) => {
  const { id } = req.body;
  await pool.query("DELETE FROM earthquakes WHERE id=$1", [id]);
  await pool.query("DELETE FROM earthquakes WHERE id=$1", [Number(id)]);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// обновить событие
app.post("/api/update", auth, async (req, res) => {
  const { id, date, time, lat, lon, magnitude, comment } = req.body;
  await pool.query(
    "UPDATE earthquakes SET date=$2, time=$3, lat=$4, lon=$5, magnitude=$6, comment=$7 WHERE id=$1",
    [Number(id), date, time, lat, lon, magnitude, comment]
  );
  res.json({ ok: true });
});
