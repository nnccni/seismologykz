let map;
let markersLayer;

function initMap() {
  map = L.map("map").setView([43.25, 76.9], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function renderMap(data) {
  markersLayer.clearLayers();
  data.forEach(r => {
    if (r.lat && r.lon) {
      L.circleMarker([Number(r.lat), Number(r.lon)], {
        radius: 8,
        color: "blue",
        fillColor: "blue",
        fillOpacity: 0.7
      })
      .addTo(markersLayer)
      .bindPopup(`${r.date || ""} ${r.time || ""}<br>M ${r.magnitude || ""}<br>${r.comment || ""}`);
    }
  });
}

function renderTable(data) {
  const table = document.getElementById("events");
  let html = `
    <tr>
      <th>Дата</th>
      <th>Время</th>
      <th>Широта</th>
      <th>Долгота</th>
      <th>Магнитуда</th>
      <th>Комментарий</th>
    </tr>
  `;
  data.forEach(r => {
    html += `
      <tr>
        <td>${r.date || ""}</td>
        <td>${r.time || ""}</td>
        <td>${r.lat || ""}</td>
        <td>${r.lon || ""}</td>
        <td>${r.magnitude || ""}</td>
        <td>${r.comment || ""}</td>
      </tr>
    `;
  });
  table.innerHTML = html;
}

async function loadData() {
  const res = await fetch("/api/earthquakes");
  const data = await res.json();
  renderMap(data);
  renderTable(data);
}

// инициализация
initMap();
loadData();
