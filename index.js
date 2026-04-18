import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd(), "public")));

const SECRET = "supersecretjwtkey123";

const dataFile = path.join(process.cwd(), "data", "earthquakes.json");
const seedFile = path.join(process.cwd(), "data", "seed-earthquakes.json");

// вспомогательные функции
function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function ensureData() {
  if (!fs.existsSync(dataFile)) {
    if (fs.existsSync(seedFile)) {
      fs.copyFileSync(seedFile, dataFile);
    } else {
      fs.writeFileSync(seedFile, JSON.stringify([], null, 2));
      fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
    }
  }
}
ensureData();

// middleware для проверки токена
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.redirect("/login.html");
  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    return res.redirect("/login.html");
  }
}

// маршрут для логина
app.post("/auth", (req, res) => {
  const { username, password } = req.body;
  // простая проверка (можно заменить на базу)
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ user: username }, SECRET, { expiresIn: "1h" });
    res.json({ ok: true, token });
  } else {
    res.status(401).json({ ok: false, error: "Неверный логин или пароль" });
  }
});

// корень — кабинет оператора, только после авторизации
app.get("/", auth, (req, res) => {
  res.sendFile(path.join(process.cwd(), "list.html"));
});

// публичная часть без авторизации
app.get("/public", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public.html"));
});

// API: получить все события
app.get("/api/earthquakes", (req, res) => {
  res.json(read(dataFile));
});

// API: добавить событие (только авторизованные)
app.post("/api/add", auth, (req, res) => {
  const data = read(dataFile);
  const record = { id: Date.now(), ...req.body };
  data.push(record);
  write(dataFile, data);

  let seedData = [];
  if (fs.existsSync(seedFile)) {
    seedData = read(seedFile);
  }
  seedData.push(record);
  write(seedFile, seedData);

  res.json({ ok: true, record });
});

// API: удалить событие (только авторизованные)
app.post("/api/delete", auth, (req, res) => {
  const { id } = req.body;
  let data = read(dataFile).filter(r => r.id !== id);
  write(dataFile, data);

  let seedData = read(seedFile).filter(r => r.id !== id);
  write(seedFile, seedData);

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
