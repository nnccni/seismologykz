async function loadPublic() {
  const res = await fetch("/api/earthquakes");
  const json = await res.json();

  renderTable(json.data);
  renderMap(json.data);
}

function renderTable(data) {
  const tbody = document.getElementById("public-table");
  tbody.innerHTML = "";

  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.magnitude}</td>
      <td>${r.lat}</td>
      <td>${r.lon}</td>
      <td>${r.comment}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderMap(data) {
  const map = L.map("map").setView([43.25, 76.9], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  data.forEach(r => {
    L.circleMarker([r.lat, r.lon], {
      radius: 8,
      color: "red",
      fillColor: "red",
      fillOpacity: 0.8
    }).addTo(map).bindPopup(`${r.date} ${r.time}<br>M ${r.magnitude}`);
  });
}

document.addEventListener("DOMContentLoaded", loadPublic);
