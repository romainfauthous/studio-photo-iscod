const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db"); // <-- on importe la connexion

const app = express();
const PORT = process.env.PORT || 3001;

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const placeRoutes = require("./routes/placeRoutes");
const articleRoutes = require("./routes/articleRoutes");
const decorRoutes = require("./routes/decorRoutes");
const eventRoutes = require("./routes/eventRoutes");
const historyRoutes = require("./routes/historyRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/decors", decorRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Le serveur du studio photo fonctionne !" });
});

// Test de connexion à la base au démarrage
async function testDbConnection() {
  try {
    await db.query("SELECT 1");
    console.log("✅ Connexion à MySQL réussie (base studio_photo)");
  } catch (error) {
    console.error("❌ Échec de connexion à MySQL :", error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  testDbConnection();
});
