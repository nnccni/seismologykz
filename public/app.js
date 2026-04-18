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
    if (!isNaN(r.lat) && !isNaN(r.lon)) {
      let fillColor, borderColor;
      if (r.magnitude >= 4) {
        fillColor = "red"; borderColor = "darkred";
      } else if (r.magnitude >= 3) {
        fillColor = "orange"; borderColor = "darkorange";
      } else {
        fillColor = "#FFD700"; borderColor = "black"; // яркий жёлтый с чёрной рамкой
      }

      L.circleMarker([r.lat, r.lon], {
        radius: 10,
        color: borderColor,
        fillColor: fillColor,
        fillOpacity: 0.9,
        weight: 2
      }).addTo(markersLayer).bindPopup(`
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
      <td>${r.lat}</td>
      <td>${r.lon}</td>
      <td>${r.magnitude}</td>
      <td>${r.comment || ""}</td>
      <td><a href="#" onclick="deleteEvent(${r.id})" class="link-danger">Удалить</a></td>
    `;
    tbody.appendChild(tr);
  });
}

// Загрузка данных
async function loadData() {
  const res = await fetch("/api/earthquakes");
  const json = await res.json();
  renderTable(json.data);
  updateMap(json.data);
}

// Установка текущей даты и времени
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
    comment: document.getElementById("comment").value
  };

  const res = await fetch("/api/add", {
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
    window.location.href = "/";
  }
});

// Удаление события
async function deleteEvent(id) {
  const res = await fetch(`/api/delete/${id}`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  });
  const json = await res.json();
  if (json.ok) {
    loadData();
  } else {
    alert("Ошибка удаления. Возможно, нет авторизации.");
    window.location.href = "/";
  }
}

// При загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
  if (!localStorage.getItem("token")) {
    window.location.href = "/";
    return;
  }
  initMap();
  setCurrentDateTime();
  await loadData();
});
