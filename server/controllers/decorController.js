const decorModel = require("./../models/decorModel");
const articleModel = require("./../models/articleModel");

async function getAllDecors(req, res) {
  try {
    const decors = await decorModel.findAll();
    res.json(decors);
  } catch (error) {
    console.error("Erreur getAllDecors :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function getDecorById(req, res) {
  try {
    const { id } = req.params;
    const decor = await decorModel.findById(id);
    if (!decor) {
      return res.status(404).json({ message: "Décor introuvable." });
    }
    res.json(decor);
  } catch (error) {
    console.error("Erreur getDecorById :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function createDecor(req, res) {
  try {
    const { name, description, article_ids } = req.body;

    // 1. Nom obligatoire
    if (!name?.trim()) {
      return res.status(400).json({ message: "Le nom du décor est obligatoire." });
    }
    // 2. Au moins un article (règle métier : un décor est composé d'au moins un article)
    if (!Array.isArray(article_ids) || article_ids.length === 0) {
      return res.status(400).json({ message: "Un décor doit contenir au moins un article." });
    }
    // 3. Cohérence : tous les articles existent-ils ? (Décision B)
    for (const articleId of article_ids) {
      const article = await articleModel.findById(articleId);
      if (!article) {
        return res.status(400).json({ message: `L'article ${articleId} n'existe pas.` });
      }
      if (article.statut === "perdu") {
        return res.status(400).json({ message: `L'article "${article.name}" est perdu et ne peut pas être ajouté à un décor.` });
      }
    }

    const newId = await decorModel.create({
      name: name.trim(),
      description: description?.trim() || null,
      article_ids,
    });
    res.status(201).json({ message: "Décor créé avec succès.", decor_id: newId });
  } catch (error) {
    console.error("Erreur createDecor :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function updateDecor(req, res) {
  try {
    const { id } = req.params;
    const { name, description, article_ids } = req.body;

    // 1. Le décor existe-t-il ?
    const existing = await decorModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Décor introuvable." });
    }
    // 2. Nom obligatoire
    if (!name?.trim()) {
      return res.status(400).json({ message: "Le nom du décor est obligatoire." });
    }
    // 3. Au moins un article
    if (!Array.isArray(article_ids) || article_ids.length === 0) {
      return res.status(400).json({ message: "Un décor doit contenir au moins un article." });
    }
    // 4. Tous les articles existent-ils ?
    for (const articleId of article_ids) {
      const article = await articleModel.findById(articleId);
      if (!article) {
        return res.status(400).json({ message: `L'article ${articleId} n'existe pas.` });
      }
      if (article.statut === "perdu") {
        return res.status(400).json({ message: `L'article "${article.name}" est perdu et ne peut pas être ajouté à un décor.` });
      }
    }

    await decorModel.update(id, {
      name: name.trim(),
      description: description?.trim() || null,
      article_ids,
    });
    const updated = await decorModel.findById(id);
    res.status(200).json({ message: "Décor mis à jour.", decor: updated });
  } catch (error) {
    console.error("Erreur updateDecor :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function deleteDecor(req, res) {
  try {
    const { id } = req.params;
    const existing = await decorModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Décor introuvable." });
    }
    await decorModel.remove(id);
    res.status(200).json({ message: "Décor supprimé." });
  } catch (error) {
    console.error("Erreur deleteDecor :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { getAllDecors, getDecorById, createDecor, updateDecor, deleteDecor };