function authHeader() {
  return { Authorization: "Bearer " + localStorage.getItem("token") };
}

async function loadData() {
  const res = await fetch("/api/earthquakes-auth", {
    headers: authHeader()
  });

  const json = await res.json();
  if (!json.ok) return alert("Ошибка авторизации");

  render(json.data);
}

function render(data) {
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
      <td>${r.comment}</td>
      <td><button onclick="del(${r.id})">Удалить</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function del(id) {
  await fetch(`/api/delete/${id}`, { headers: authHeader() });
  loadData();
}

document.addEventListener("DOMContentLoaded", loadData);
