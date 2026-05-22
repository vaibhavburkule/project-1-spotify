// server.js
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.static(__dirname));

const client = new MongoClient("mongodb://localhost:27017");

async function startServer() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected");

    app.get("/tracks", async (req, res) => {
      try {
        const tracks = await client
          .db("spotifyClone")
          .collection("tracks")
          .find({})
          .sort({ id: 1 })   
          .toArray();
        res.json(tracks);
      } catch (err) {
        console.error(" Error fetching tracks:", err);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();