require("dotenv").config();

const OpenAI = require("openai");
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Diya@1105",
    database: "phishgame"
});


// ✅ GET route (used by your game)
app.get("/emails", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM emails ORDER BY RAND() LIMIT 5"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


// 🔥 NEW POST ROUTE (for custom email checking)
app.post("/check-email", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
          You are a strict phishing detector.
          Reply ONLY in JSON format like this:
          {
          "isPhishing": true or false,
          "reason": "short explanation"
          }
          Classify as phishing ONLY if there is clear malicious intent such as:
          - asking for passwords or sensitive info
          - fake prizes or refunds
          - urgent threats or account suspension
          - suspicious or misleading links
          If the message is neutral and could be a normal business notification, classify as NOT phishing.
          `
          },
        { role: "user", content: message }
      ],
      temperature: 0
    });

    const aiResponse = completion.choices[0].message.content;

    const parsed = JSON.parse(aiResponse);

    res.json(parsed);

  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({ error: "AI classification failed" });
  }
});


app.listen(5000, () => {
    console.log("Server running on port 5000");
});