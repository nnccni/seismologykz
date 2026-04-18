function renderMap(data) {
  const map = L.map("map").setView([43.25, 76.9], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  data.forEach(r => {
    if (r.lat && r.lon) {
      L.circleMarker([Number(r.lat), Number(r.lon)], {
        radius: 8,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.8
      })
      .addTo(map)
      .bindPopup(`${r.date || ""} ${r.time || ""}<br>M ${r.magnitude || ""}`);
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
      </tr>
    `;
  });
  table.innerHTML = html;
}

fetch("/api/earthquakes")
  .then(r => r.json())
  .then(json => {
    renderMap(json);
    renderTable(json);
  })
  .catch(err => console.error("Ошибка загрузки данных:", err));
