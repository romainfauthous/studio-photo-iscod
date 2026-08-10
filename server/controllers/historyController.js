const historyModel = require("./../models/historyModel");
const userModel = require("./../models/userModel");

async function getWorkHistory(req, res) {
  try {
    const history = await historyModel.getWorkHistory();
    res.json(history);
  } catch (error) {
    console.error("Erreur getWorkHistory :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function getWorkHistoryByUser(req, res) {
  try {
    const { userId } = req.params;
    // On vérifie que le prestataire existe (message clair sinon)
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Prestataire introuvable." });
    }
    const history = await historyModel.getWorkHistoryByUser(userId);
    res.json(history);
  } catch (error) {
    console.error("Erreur getWorkHistoryByUser :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function getPhotographedArticles(req, res) {
  try {
    const articles = await historyModel.getPhotographedArticles();
    res.json(articles);
  } catch (error) {
    console.error("Erreur getPhotographedArticles :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function getPhotographedDecors(req, res) {
  try {
    const decors = await historyModel.getPhotographedDecors();
    res.json(decors);
  } catch (error) {
    console.error("Erreur getPhotographedDecors :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = {
  getWorkHistory,
  getWorkHistoryByUser,
  getPhotographedArticles,
  getPhotographedDecors,
};