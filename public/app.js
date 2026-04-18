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
  data.forEach(r => {
    if (r.lat && r.lon) {
      const color = r.magnitude >= 4 ? "red" : r.magnitude >= 3 ? "orange" : "yellow";
      L.circleMarker([r.lat, r.lon], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8
      }).addTo(markersLayer).bindPopup(`
        <b>${r.date} ${r.time}</b><br/>
        M: ${r.magnitude}<br/>
        ${r.comment || ""}
      `);
    }
  });
}

function renderTable(data) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.lat}</td>
      <td>${r.lon}</td>
      <td>${r.magnitude}</td>
      <td>${r.comment || ""}</td>
      <td><a href="/api/delete/${r.id}" class="link-danger">Удалить</a></td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadData() {
  const res = await fetch("/api/earthquakes");
  const json = await res.json();
  renderTable(json.data);
  updateMap(json.data);
}

function setCurrentDateTime() {
  const now = new Date();
  document.getElementById("date").value = now.toISOString().split("T")[0];
  document.getElementById("time").value = now.toTimeString().slice(0,
