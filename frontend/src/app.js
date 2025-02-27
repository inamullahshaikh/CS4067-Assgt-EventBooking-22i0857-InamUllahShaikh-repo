document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Mock API call to login
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        localStorage.setItem("user", username);
        window.location.href = "events.html";
      } else {
        document.getElementById("error-message").innerText =
          "Invalid Credentials";
      }
    });
  }

  // Show user & fetch events on events.html
  const userSpan = document.getElementById("user");
  if (userSpan) {
    const user = localStorage.getItem("user");
    if (!user) window.location.href = "index.html";
    userSpan.innerText = user;

    // Fetch available events
    fetch("http://localhost:5002/events")
      .then((res) => res.json())
      .then((data) => {
        const eventList = document.getElementById("event-list");
        data.forEach((event) => {
          const li = document.createElement("li");
          li.innerHTML = `${event.name} <button onclick="bookEvent(${event.id})">Book</button>`;
          eventList.appendChild(li);
        });
      });
  }
});

// Booking an event
function bookEvent(eventId) {
  const user = localStorage.getItem("user");
  fetch("http://localhost:5003/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user, event_id: eventId }),
  }).then(() => alert("Event Booked!"));
}

// Logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}
