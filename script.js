const chatForm = document.getElementById("chat-form");
function isReminderPrompt(text) {
  return text.toLowerCase().startsWith("remind me");
}
//Reminder set for "submit the report" at 7/23/2025, 10:22:00 AM
function extractReminder(text) {
  const regex = /remind me (at|on)?\s*(\d{1,2}(:\d{2})?\s*(am|pm)?)\s*(today|tomorrow)?\s*to (.+)/i;
  const match = text.match(regex);
  if (!match) return null;

  const timeStr = match[2];
  const day = match[5] || "today";
  const task = match[6];

  const now = new Date();
  const target = new Date(now);
  const [hour, minute = "00"] = timeStr.replace(/(am|pm)/i, "").split(":");
  let hr = parseInt(hour);
  const isPM = /pm/i.test(timeStr);

  if (isPM && hr < 12) hr += 12;
  if (!isPM && hr === 12) hr = 0;

  target.setHours(hr, parseInt(minute), 0, 0);
  if (day === "tomorrow") target.setDate(now.getDate() + 1);

  return {
    title: task.split(" ").slice(0, 5).join(" "),
    desc: task,
    datetime: target.toISOString(),
  };
}

const userInput = document.getElementById("user-input");
const chatContainer = document.getElementById("chat-container");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  displayMessage("You", message);
  userInput.value = "";

  // 👉 Check if it's a reminder prompt
  if (isReminderPrompt(message)) {
    const reminder = extractReminder(message);
    if (reminder) {
      const email = document.getElementById("email").value;
      if (!email) {
        displayMessage("AI", "⚠️ Please enter your email above to set reminders.");
        return;
      }

      await fetch("http://localhost:5000/addReminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reminder, email })
      });

      displayMessage("AI", `✅ Reminder set for "${reminder.desc}" at ${new Date(reminder.datetime).toLocaleString()}`);
      return; // ❌ Don't send to AI if it's a reminder
    }
  }

  // 👉 Regular AI chat call
  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    displayMessage("AI", data.response);
  } catch {
    displayMessage("Error", "⚠️ Failed to get response.");
  }
});


function displayMessage(sender, msg) {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${msg}`;
  chatContainer.appendChild(div);
}

// Reminder
const reminderForm = document.getElementById("reminder-form");
reminderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;
  const datetime = document.getElementById("datetime").value;

  const res = await fetch("http://localhost:5000/addReminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, title, desc, datetime }),
  });

  const data = await res.json();
  alert(data.message || "Reminder set.");
});
