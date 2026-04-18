let map;
let markersLayer;

// Инициализация карты
function initMap() {
  map = L.map("map").setView([43.25, 76.9], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// Обновление карты
function updateMap(data) {
  markersLayer.clearLayers();
  data.forEach(r => {
    if (r.lat && r.lon) {
      const color =
        r.magnitude >= 4 ? "red" : r.magnitude >= 3 ? "orange" : "yellow";

      const marker = L.circleMarker([r.lat, r.lon], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8
      }).addTo(markersLayer);

      marker.bindPopup(`
        <b>${r.date} ${r.time}</b><br/>
        M: ${r.magnitude}<br/>
        ${r.comment || ""}
      `);
    }
  });
}

// Отрисовка таблицы
function renderTable(data) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.magnitude}</td>
      <td>${r.lat}</td>
      <td>${r.lon}</td>
      <td>${r.comment || ""}</td>
      <td><a href="https://seismologykz.up.railway.app/api/delete/${r.id}" class="link-danger">Удалить</a></td>
    `;
    tbody.appendChild(tr);
  });
}

// Загрузка данных
async function loadData() {
  const res = await fetch("https://seismologykz.up.railway.app/api/earthquakes");
  const json = await res.json();
  renderTable(json.data);
  updateMap(json.data);
}

// Установка текущей даты и времени в форму
function setCurrentDateTime() {
  const now = new Date();
  document.getElementById("date").value = now.toISOString().split("T")[0];
  document.getElementById("time").value = now.toTimeString().slice(0,5);
}

// Сохранение события
document.getElementById("addForm").addEventListener("submit", async e => {
  e.preventDefault();
  const record = {
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    lat: parseFloat(document.getElementById("lat").value),
    lon: parseFloat(document.getElementById("lon").value),
    magnitude: parseFloat(document.getElementById("magnitude").value),
    comment: document.getElementById("comment")?.value || ""
  };

  const res = await fetch("https://seismologykz.up.railway.app/api/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(record)
  });
  const json = await res.json();
  if (json.ok) {
    loadData();
  } else {
    alert("Ошибка сохранения. Возможно, нет авторизации.");
  }
});

// При загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
  initMap();
  setCurrentDateTime();
  await loadData();
});
