document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const res = await fetch("https://seismologykz.up.railway.app/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password })
  });
  const json = await res.json();

  if (json.ok) {
    localStorage.setItem("token", json.token);
    window.location.href = "/";
  } else {
    alert("Неверный логин или пароль");
  }
});
