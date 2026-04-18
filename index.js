import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd(), "public")));

const dataFile = path.join(process.cwd(), "data", "earthquakes.json");
const seedFile = path.join(process.cwd(), "data", "seed-earthquakes.json");

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// при старте восстанавливаем earthquakes.json из seed
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

// API: получить все события
app.get("/api/earthquakes", (req, res) => {
  res.json(read(dataFile));
});

// API: добавить событие
app.post("/api/add", (req, res) => {
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

// API: удалить событие
app.post("/api/delete", (req, res) => {
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
