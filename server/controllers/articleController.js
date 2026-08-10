const articleModel = require("./../models/articleModel");

const ALLOWED_STATUTS = ["disponible", "deteriore", "perdu"];

async function getAllArticles(req, res) {
  try {
    const articles = await articleModel.findAll();
    res.json(articles);
  } catch (error) {
    console.error("Erreur getAllArticles :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function getArticleById(req, res) {
  try {
    const { id } = req.params;
    const article = await articleModel.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Article introuvable." });
    }
    res.json(article);
  } catch (error) {
    console.error("Erreur getArticleById :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function createArticle(req, res) {
  try {
    const { reference, name, statut, notes } = req.body;

    // Champs obligatoires (notes est optionnel, donc exclu)
    if (!reference?.trim() || !name?.trim() || !statut?.trim()) {
      return res.status(400).json({ message: "Référence, nom et statut sont obligatoires." });
    }
    // Statut autorisé
    if (!ALLOWED_STATUTS.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide (disponible, deteriore ou perdu)." });
    }
    // Unicité de la référence
    const existant = await articleModel.findByReference(reference.trim());
    if (existant) {
      return res.status(409).json({ message: "Cette référence est déjà utilisée." });
    }

    const newId = await articleModel.create({
      reference: reference.trim(),
      name: name.trim(),
      statut,
      notes: notes?.trim() || null, // optionnel : null si absent ou vide
    });
    res.status(201).json({ message: "Article créé avec succès.", article_id: newId });
  } catch (error) {
    console.error("Erreur createArticle :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function updateArticle(req, res) {
  try {
    const { id } = req.params;
    const { reference, name, statut, notes } = req.body;

    const existing = await articleModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Article introuvable." });
    }
    if (!reference?.trim() || !name?.trim() || !statut?.trim()) {
      return res.status(400).json({ message: "Référence, nom et statut sont obligatoires." });
    }
    if (!ALLOWED_STATUTS.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide (disponible, deteriore ou perdu)." });
    }
    // Référence déjà prise PAR UN AUTRE article ?
    const refOwner = await articleModel.findByReference(reference.trim());
    if (refOwner && refOwner.article_id !== Number(id)) {
      return res.status(409).json({ message: "Cette référence est déjà utilisée." });
    }

    await articleModel.update(id, {
      reference: reference.trim(),
      name: name.trim(),
      statut,
      notes: notes?.trim() || null,
    });
    const updated = await articleModel.findById(id);
    res.status(200).json({ message: "Article mis à jour.", article: updated });
  } catch (error) {
    console.error("Erreur updateArticle :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function deleteArticle(req, res) {
  try {
    const { id } = req.params;
    const existing = await articleModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Article introuvable." });
    }
    await articleModel.remove(id);
    res.status(200).json({ message: "Article supprimé." });
  } catch (error) {
    console.error("Erreur deleteArticle :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle };