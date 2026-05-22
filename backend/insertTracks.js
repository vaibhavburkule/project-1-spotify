const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // ya apna MongoDB Atlas URI
const client = new MongoClient(uri);

const tracks = [
  {
    id: 0,
    title: "Agar Tum Saath Ho",
    artist: "Arijit Singh, Alka Yagnik",
    image: "./images/agar-tum-saath-ho.png",
    audioUrl: "./audios/agar-tum-saath-ho.mp3",
  },
  {
    id: 1,
    title: "Believer",
    artist: "Imagine Dragons",
    image: "./images/believer.png",
    audioUrl: "./audios/believer.mp3",
  },
  {
    id: 2,
    title: "Heat Waves",
    artist: "Glass Animals",
    image: "./images/heat-waves.png",
    audioUrl: "./audios/heat-waves.mp3",
  },
  {
    id: 3,
    title: "Jo Tum Mere Ho",
    artist: "Anuv Jain",
    image: "./images/jo-tum-mere-ho.png",
    audioUrl: "./audios/jo-tum-mere-ho.mp3",
  },
  {
    id: 4,
    title: "Kesariya",
    artist: "Arijit Singh",
    image: "./images/kesariya.png",
    audioUrl: "./audios/kesariya.mp3",
  },
  {
    id: 5,
    title: "Love Me Like You Do",
    artist: "Ellie Goulding",
    image: "./images/love-me-like-you-do.png",
    audioUrl: "./audios/love-me-like-you-do.mp3",
  },
  {
    id: 6,
    title: "Sahiba",
    artist: "Jasleen Royal",
    image: "./images/sahiba.png",
    audioUrl: "./audios/sahiba.mp3",
  },
  {
    id: 7,
    title: "Shape of You",
    artist: "Ed Sheeran",
    image: "./images/shape-of-you.png",
    audioUrl: "./audios/shape-of-you.mp3",
  },
  {
    id: 8,
    title: "Stay With Me",
    artist: "Sam Smith",
    image: "./images/stay-with-me.png",
    audioUrl: "./audios/stay-with-me.mp3",
  },
  {
    id: 9,
    title: "Unstoppable",
    artist: "Sia",
    image: "./images/unstoppable.png",
    audioUrl: "./audios/unstoppable.mp3",
  },
];

async function insertTracks() {
  try {
    await client.connect();
    const db = client.db("spotifyClone");         // database name
    const collection = db.collection("tracks");   // collection name

    // Pehle se data ho toh clear karo (optional)
    await collection.deleteMany({});

    const result = await collection.insertMany(tracks);
    console.log(`✅ ${result.insertedCount} tracks inserted!`);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

insertTracks();