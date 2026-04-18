let map;
let markersLayer;

function initMap() {
  map = L.map("map");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // границы Казахстана (примерный прямоугольник)
  const kazakhstanBounds = [
    [40.0, 55.0], // юго-запад
    [55.0, 87.0]  // северо-восток
  ];
  map.fitBounds(kazakhstanBounds);
}

function renderMap(data) {
  markersLayer.clearLayers();
  data.forEach(r => {
    if (r.lat && r.lon) {
      L.circleMarker([Number(r.lat), Number(r.lon)], {
        radius: 8,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.8
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

// автообновление каждые 30 секунд
setInterval(loadData, 30000);

// инициализация
initMap();
loadData();
