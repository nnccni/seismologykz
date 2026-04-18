import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const SECRET = "supersecretjwtkey123";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const dataFile = path.join(__dirname, "data", "earthquakes.json");
const logFile = path.join(__dirname, "data", "logs.json");
const usersFile = path.join(__dirname, "data", "users.json");

function ensure(file, def) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(def, null, 2));
}

ensure(dataFile, []);
ensure(logFile, []);
ensure(usersFile, [
  { login: "admin", password: "12345" },
  { login: "operator", password: "op123" }
]);

const read = f => JSON.parse(fs.readFileSync(f));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ ok: false });
  }
}

app.post("/auth", (req, res) => {
  const { login, password } = req.body;
  const users = read(usersFile);

  const user = users.find(u => u.login === login && u.password === password);
  if (!user) return res.json({ ok: false });

  const token = jwt.sign({ login }, SECRET, { expiresIn: "7d" });
  res.json({ ok: true, token });
});

app.get("/api/earthquakes", (req, res) => {
  res.json({ ok: true, data: read(dataFile) });
});

app.post("/api/add", auth, (req, res) => {
  const data = read(dataFile);
  const record = { id: Date.now(), ...req.body };
  data.push(record);
  write(dataFile, data);
  res.json({ ok: true, record });
});

app.get("/api/delete/:id", auth, (req, res) => {
  let data = read(dataFile);
  data = data.filter(r => r.id != req.params.id);
  write(dataFile, data);
  res.json({ ok: true });
});

// маршрут для корня — кабинет оператора
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "list.html"));
});

// маршрут для публичной части
app.get("/public", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "public.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Running on", port));
