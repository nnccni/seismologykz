if (!localStorage.getItem("token")) {
  window.location.href = "/";
}

let map;
let markersLayer;

function initMap() {
  map = L.map("map").setView([48.0, 67.0], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function setDefaultDateTime() {
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  document.getElementById("time").value = new Date().toTimeString().slice(0,5);
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
      <th>Действия</th>
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
        <td>
          <button onclick="editEvent(${r.id})">✎</button>
          <button onclick="deleteEvent(${r.id})">X</button>
        </td>
      </tr>
    `;
  });
  table.innerHTML = html;
}

async function loadData() {
  const res = await fetch("/api/earthquakes", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });
  let data = await res.json();

  data.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB - dateA;
  });

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

  const editId = document.getElementById("eventForm").dataset.editId;

  if (editId) {
    await fetch("/api/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ id: Number(editId), ...record })
    });
    delete document.getElementById("eventForm").dataset.editId;
  } else {
    await fetch("/api/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(record)
    });
  }

  document.getElementById("eventForm").reset();
  setDefaultDateTime();
  loadData();
});

async function deleteEvent(id) {
  await fetch("/api/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ id: Number(id) })
  });
  loadData();
}

function editEvent(id) {
  fetch("/api/earthquakes", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  })
  .then(res => res.json())
  .then(data => {
    const event = data.find(r => Number(r.id) === Number(id));
    if (event) {
      document.getElementById("date").value = event.date;
      document.getElementById("time").value = event.time;
      document.getElementById("lat").value = event.lat;
      document.getElementById("lon").value = event.lon;
      document.getElementById("magnitude").value = event.magnitude;
      document.getElementById("comment").value = event.comment;
      document.getElementById("eventForm").dataset.editId = id;
    }
  });
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

document.getElementById("downloadLog").addEventListener("click", async () => {
  const res = await fetch("/api/earthquakes", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });
  const data = await res.json();

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "earthquakes-log.json";
  a.click();

  URL.revokeObjectURL(url);
});

initMap();
setDefaultDateTime();
loadData();
