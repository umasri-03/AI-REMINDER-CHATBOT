import React, { useEffect, useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [savedChats, setSavedChats] = useState([]);
  const [userId] = useState("user123");
  const [chatId, setChatId] = useState(null);

  const generateTitle = (text) => text.length > 40 ? text.slice(0, 37) + "..." : text;

  const sendMessage = () => {
    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage, { role: "bot", content: "Response here..." }];
    setMessages(updatedMessages);
    setInput("");

    fetch("/api/save-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: generateTitle(input),
        messages: updatedMessages,
      }),
    }).then(res => res.json()).then(data => setChatId(data.chatId));
  };

  useEffect(() => {
    fetch(`/api/chats/${userId}`)
      .then(res => res.json())
      .then(data => setSavedChats(data));
  }, [chatId]);

  return (
    <div>
      <h1>AI Chatbot</h1>
      <div>
        {savedChats.map(chat => (
          <button key={chat._id} onClick={() => {
            fetch(`/api/chat/${chat._id}`)
              .then(res => res.json())
              .then(data => setMessages(data.messages));
          }}>
            {chat.title}
          </button>
        ))}
      </div>
      <div>
        {messages.map((msg, i) => <p key={i}><b>{msg.role}:</b> {msg.content}</p>)}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}