async function loadData() {
  const res = await fetch("/api/earthquakes");
  const data = await res.json();
  renderTable(data);
  updateMap(data);
}

async function applyFilters() {
  const range = document.getElementById("range").value;
  const minMag = document.getElementById("minMag").value;

  let url = "/api/earthquakes?";

  if (range) url += `range=${range}&`;
  if (minMag) url += `minMag=${minMag}`;

  const res = await fetch(url);
  const data = await res.json();

  renderTable(data);
  updateMap(data);
}

function renderTable(data) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  data.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.magnitude}</td>
      <td>${r.lat}</td>
      <td>${r.lon}</td>
      <td>${r.comment}</td>
      <td><a href="/api/delete/${r.id}" class="link-danger">Удалить</a></td>
    `;
    tbody.appendChild(tr);
  });
}

let map;
let markersLayer;

function initMap() {
  map = L.map("map").setView([43.25, 76.9], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function updateMap(data) {
  markersLayer.clearLayers();

  data.forEach((r) => {
    if (typeof r.lat === "number" && typeof r.lon === "number") {
      const color =
        r.magnitude >= 4 ? "red" : r.magnitude >= 3 ? "orange" : "yellow";

      const marker = L.circleMarker([r.lat, r.lon], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8
      }).addTo(markersLayer);

      const text = `
        <b>${r.date} ${r.time}</b><br/>
        M: ${r.magnitude}<br/>
        ${r.comment}
      `;
      marker.bindPopup(text);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initMap();
  await loadData();
});
// Установка текущей даты и времени
window.onload = () => {
  const now = new Date();
  document.getElementById("date").value = now.toISOString().split("T")[0];
  document.getElementById("time").value = now.toTimeString().slice(0,5);
  loadEvents();
};

function renderMap(data) {
  const map = L.map("map").setView([43.25, 76.9], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  data.forEach(r => {
    if (r.lat && r.lon) {
      L.circleMarker([r.lat, r.lon], {
        radius: 8,
        color: "blue",
        fillColor: "blue",
        fillOpacity: 0.8
      }).addTo(map).bindPopup(`${r.date} ${r.time}<br>M ${r.magnitude}`);
    }
  });
}

function renderTable(data) {
  const table = document.getElementById("events");
  table.innerHTML = `
    <tr>
      <th>Дата</th><th>Время</th><th>Широта</th><th>Долгота</th><th>Магнитуда</th>
    </tr>`;
  data.forEach(r => {
    table.innerHTML += `
      <tr>
        <td>${r.date}</td><td>${r.time}</td><td>${r.lat}</td><td>${r.lon}</td><td>${r.magnitude}</td>
      </tr>`;
  });
}

function loadEvents() {
  fetch("https://seismologykz.up.railway.app/api/earthquakes")
    .then(r => r.json())
    .then(json => {
      renderMap(json.data);
      renderTable(json.data);
    });
}

document.getElementById("addForm").addEventListener("submit", e => {
  e.preventDefault();
  const record = {
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    lat: document.getElementById("lat").value,
    lon: document.getElementById("lon").value,
    magnitude: document.getElementById("magnitude").value
  };

  fetch("https://seismologykz.up.railway.app/api/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  })
  .then(r => r.json())
  .then(res => {
    if (res.ok) loadEvents();
    else alert("Ошибка сохранения");
  });
});
