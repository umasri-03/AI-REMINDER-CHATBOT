require('dotenv').config({ path: __dirname + '/.env' });
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let reminders = [];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/addReminder", (req, res) => {
  const { email, title, desc, datetime } = req.body;
  const time = new Date(datetime);
  if (!email || !title || !datetime || isNaN(time)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  reminders.push({ email, title, desc, time });
  res.status(200).json({ message: "Reminder added successfully" });
});

cron.schedule("* * * * *", () => {
  const now = new Date();
  reminders = reminders.filter((reminder) => {
    const timeDiff = reminder.time - now;
    if (timeDiff <= 0) {
      sendEmail(reminder.email, reminder.title, reminder.desc);
      return false;
    }
    return true;
  });
});

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("❌ Error sending email:", err);
    } else {
      console.log("✅ Email sent:", info.response);
    }
  });
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("AI API Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
