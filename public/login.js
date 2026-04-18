document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const username = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const json = await res.json();

  if (json.ok) {
    localStorage.setItem("token", json.token);
    window.location.href = "/"; // кабинет открывается по корню
  } else {
    alert("Неверный логин или пароль");
  }
});
