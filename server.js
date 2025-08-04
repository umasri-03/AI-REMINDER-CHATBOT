const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Chat = require("./models/Chat");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.post("/api/save-chat", async (req, res) => {
  const { userId, title, messages } = req.body;
  try {
    const chat = new Chat({ userId, title, messages });
    await chat.save();
    res.json({ success: true, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ error: "Error saving chat" });
  }
});

app.get("/api/chats/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Error fetching chats" });
  }
});

app.get("/api/chat/:chatId", async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Error fetching chat" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port", PORT));