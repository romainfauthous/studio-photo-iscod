const mongoose = require("mongoose");

async function connectMongoDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/studio_photo_logs");
    console.log("✅ Connexion à MongoDB réussie (base studio_photo_logs)");
  } catch (error) {
    console.error("❌ Échec connexion MongoDB :", error.message);
  }
}

module.exports = { connectMongoDB };