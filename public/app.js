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
      <th>Удалить</th>
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
        <td><button onclick="deleteEvent(${r.id})">X</button></td>
      </tr>
    `;
  });
  table.innerHTML = html;
}

async function loadData() {
  const res = await fetch("/api/earthquakes", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });
  const data = await res.json();
  renderMap(data);
  renderTable(data);
}

document.getElementById("eventForm").addEventListener("submit", async e => {
  e.preventDefault();
  const record = {
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    lat: document.getElementById("lat").value,
    lon: document.getElementById("lon").value,
    magnitude: document.getElementById("magnitude").value,
    comment: document.getElementById("comment").value
  };

  await fetch("/api/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(record)
  });

  loadData();
});

async function deleteEvent(id) {
  await fetch("/api/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ id })
  });
  loadData();
}

// загрузка при открытии
loadData();
