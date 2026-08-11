const eventModel = require("./../models/eventModel");
const placeModel = require("./../models/placeModel");
const userModel = require("./../models/userModel");
const articleModel = require("./../models/articleModel");
const decorModel = require("./../models/decorModel");

const ALLOWED_TYPES = ["shooting_studio", "shooting_decor", "prepa_decor", "retrait_decor"];
const REQUIRED_ROLES = {
  shooting_studio: ["photographe", "assistant_photographe"],
  prepa_decor: ["decorateur", "assistant_decorateur", "chauffeur_assistant"],
  shooting_decor: ["decorateur", "assistant_decorateur", "photographe", "assistant_photographe", "chauffeur_assistant"],
  retrait_decor: ["assistant_decorateur", "chauffeur_assistant"],
};
const ROLE_LABELS = {
  photographe: "Photographe",
  assistant_photographe: "Assistant photographe",
  decorateur: "Décorateur",
  assistant_decorateur: "Assistant décorateur",
  chauffeur_assistant: "Chauffeur assistant",
};

const TYPE_LABELS = {
  shooting_studio: "Shooting studio",
  shooting_decor: "Shooting décor",
  prepa_decor: "Prépa décor",
  retrait_decor: "Retrait décor",
};

// Petit utilitaire : la date reçue est-elle une vraie date ?
function isValidDate(value) {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

async function getAllEvents(req, res) {
  try {
    const events = await eventModel.findAll();
    res.json(events);
  } catch (error) {
    console.error("Erreur getAllEvents :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const event = await eventModel.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Événement introuvable." });
    }
    res.json(event);
  } catch (error) {
    console.error("Erreur getEventById :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function createEvent(req, res) {
  try {
    const { start_date, end_date, type, place_id, user_ids, article_ids, decor_ids } = req.body;

    // 1. Champs obligatoires
    if (!start_date || !end_date || !type || !place_id) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    // 2. Dates valides
    if (!isValidDate(start_date) || !isValidDate(end_date)) {
      return res.status(400).json({ message: "Format de date invalide." });
    }
    // 3. Cohérence des dates
    if (new Date(end_date) <= new Date(start_date)) {
      return res.status(400).json({ message: "La date de fin doit être postérieure à la date de début." });
    }
    // 4. Type autorisé
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: "Type d'événement invalide." });
    }
    // 5. Le lieu existe-t-il ?
    const place = await placeModel.findById(place_id);
    if (!place) {
      return res.status(400).json({ message: "Le lieu spécifié n'existe pas." });
    }
    // 6. Au moins un prestataire
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: "Un événement doit mobiliser au moins un prestataire." });
    }
    // 7. Les prestataires existent + on collecte leurs rôles
    const presentRoles = [];
    for (const userId of user_ids) {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(400).json({ message: `Le prestataire ${userId} n'existe pas.` });
      }
      presentRoles.push(user.role);
    }
    // 8. Composition stricte : tous les rôles requis présents ?
    const requiredRoles = REQUIRED_ROLES[type];
    const missingRoles = requiredRoles.filter((role) => !presentRoles.includes(role));
    if (missingRoles.length > 0) {
      const missingLabels = missingRoles.map((r) => ROLE_LABELS[r] || r);
      return res.status(400).json({
        message: `Composition incomplète pour un ${TYPE_LABELS[type]}. Rôles manquants : ${missingLabels.join(", ")}.`,
      });
    }

    // 9. CONTENU selon le type (Option 1 + Option A)
    let cleanArticleIds = undefined;
    let cleanDecorIds = undefined;

    if (type === "shooting_studio") {
      // Doit avoir des articles, et PAS de décors
      if (decor_ids) {
        return res.status(400).json({ message: "Un shooting studio ne peut pas contenir de décors." });
      }
      if (!Array.isArray(article_ids) || article_ids.length === 0) {
        return res.status(400).json({ message: "Un shooting studio doit contenir au moins un article." });
      }
      for (const articleId of article_ids) {
        const article = await articleModel.findById(articleId);
        if (!article) {
          return res.status(400).json({ message: `L'article ${articleId} n'existe pas.` });
        }
      }
      cleanArticleIds = article_ids;

    } else if (type === "shooting_decor") {
      // Doit avoir des décors, et PAS d'articles
      if (article_ids) {
        return res.status(400).json({ message: "Un shooting décor ne peut pas contenir d'articles seuls." });
      }
      if (!Array.isArray(decor_ids) || decor_ids.length === 0) {
        return res.status(400).json({ message: "Un shooting décor doit contenir au moins un décor." });
      }
      for (const decorId of decor_ids) {
        const decor = await decorModel.findById(decorId);
        if (!decor) {
          return res.status(400).json({ message: `Le décor ${decorId} n'existe pas.` });
        }
      }
      cleanDecorIds = decor_ids;

    } else {
      // prepa_decor / retrait_decor : logistique, aucun contenu à rattacher
      if (article_ids || decor_ids) {
        return res.status(400).json({ message: "Ce type d'événement ne rattache ni articles ni décors." });
      }
    }

    // 10. Création en transaction
    const newId = await eventModel.create({
      start_date, end_date, type, place_id,
      user_ids,
      article_ids: cleanArticleIds,
      decor_ids: cleanDecorIds,
    });
    res.status(201).json({ message: "Événement créé avec succès.", event_id: newId });
  } catch (error) {
    console.error("Erreur createEvent :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { start_date, end_date, type, place_id, user_ids, article_ids, decor_ids } = req.body;

    // 0. L'événement existe-t-il ?
    const existing = await eventModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Événement introuvable." });
    }

    // 1. Champs obligatoires
    if (!start_date || !end_date || !type || !place_id) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    // 2. Dates valides
    if (!isValidDate(start_date) || !isValidDate(end_date)) {
      return res.status(400).json({ message: "Format de date invalide." });
    }
    // 3. Cohérence des dates
    if (new Date(end_date) <= new Date(start_date)) {
      return res.status(400).json({ message: "La date de fin doit être postérieure à la date de début." });
    }
    // 4. Type autorisé
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: "Type d'événement invalide." });
    }
    // 5. Le lieu existe-t-il ?
    const place = await placeModel.findById(place_id);
    if (!place) {
      return res.status(400).json({ message: "Le lieu spécifié n'existe pas." });
    }
    // 6. Au moins un prestataire
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: "Un événement doit mobiliser au moins un prestataire." });
    }
    // 7. Les prestataires existent + collecte des rôles
    const presentRoles = [];
    for (const userId of user_ids) {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(400).json({ message: `Le prestataire ${userId} n'existe pas.` });
      }
      presentRoles.push(user.role);
    }
    // 8. Composition stricte
    const requiredRoles = REQUIRED_ROLES[type];
    const missingRoles = requiredRoles.filter((role) => !presentRoles.includes(role));
    if (missingRoles.length > 0) {
      const missingLabels = missingRoles.map((r) => ROLE_LABELS[r] || r);
      return res.status(400).json({
        message: `Composition incomplète pour un ${TYPE_LABELS[type]}. Rôles manquants : ${missingLabels.join(", ")}.`,
      });
    }

    // 9. Contenu selon le type (Option 1 + Option A)
    let cleanArticleIds = undefined;
    let cleanDecorIds = undefined;

    if (type === "shooting_studio") {
      if (decor_ids) {
        return res.status(400).json({ message: "Un shooting studio ne peut pas contenir de décors." });
      }
      if (!Array.isArray(article_ids) || article_ids.length === 0) {
        return res.status(400).json({ message: "Un shooting studio doit contenir au moins un article." });
      }
      for (const articleId of article_ids) {
        const article = await articleModel.findById(articleId);
        if (!article) {
          return res.status(400).json({ message: `L'article ${articleId} n'existe pas.` });
        }
      }
      cleanArticleIds = article_ids;

    } else if (type === "shooting_decor") {
      if (article_ids) {
        return res.status(400).json({ message: "Un shooting décor ne peut pas contenir d'articles seuls." });
      }
      if (!Array.isArray(decor_ids) || decor_ids.length === 0) {
        return res.status(400).json({ message: "Un shooting décor doit contenir au moins un décor." });
      }
      for (const decorId of decor_ids) {
        const decor = await decorModel.findById(decorId);
        if (!decor) {
          return res.status(400).json({ message: `Le décor ${decorId} n'existe pas.` });
        }
      }
      cleanDecorIds = decor_ids;

    } else {
      if (article_ids || decor_ids) {
        return res.status(400).json({ message: "Ce type d'événement ne rattache ni articles ni décors." });
      }
    }

    // 10. Mise à jour en transaction
    await eventModel.update(id, {
      start_date, end_date, type, place_id,
      user_ids,
      article_ids: cleanArticleIds,
      decor_ids: cleanDecorIds,
    });
    const updated = await eventModel.findById(id);
    res.status(200).json({ message: "Événement mis à jour.", event: updated });
  } catch (error) {
    console.error("Erreur updateEvent :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const existing = await eventModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Événement introuvable." });
    }
    await eventModel.remove(id);
    res.status(200).json({ message: "Événement supprimé." });
  } catch (error) {
    console.error("Erreur deleteEvent :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

// --- Fonction interne réutilisée par les 4 validations ---
function normalizeValidated(value) {
  // On accepte true/false ; défaut = true (valider) si non précisé
  if (value === undefined) return true;
  return value === true;
}

async function validateArticlePicture(req, res) {
  try {
    const { eventId, articleId } = req.params;
    const validated = normalizeValidated(req.body.validated);
    const userId = req.user.user_id;

    const line = await eventModel.getEventArticle(eventId, articleId);
    if (!line) {
      return res.status(404).json({ message: "Cet article n'est pas rattaché à cet événement." });
    }
    // Déjà dans l'état demandé ? (Option 1 : on informe)
    if (Boolean(line.picture_validated) === validated) {
      return res.status(409).json({
        message: validated ? "Cette photo est déjà validée." : "Cette photo n'est pas validée.",
      });
    }

    await eventModel.setArticlePictureValidation(eventId, articleId, userId, validated);
    res.status(200).json({ message: validated ? "Photo de l'article validée." : "Validation annulée." });
  } catch (error) {
    console.error("Erreur validateArticlePicture :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function validateDecorPicture(req, res) {
  try {
    const { eventId, decorId } = req.params;
    const validated = normalizeValidated(req.body.validated);
    const userId = req.user.user_id;

    const line = await eventModel.getEventDecor(eventId, decorId);
    if (!line) {
      return res.status(404).json({ message: "Ce décor n'est pas rattaché à cet événement." });
    }
    if (Boolean(line.picture_validated) === validated) {
      return res.status(409).json({
        message: validated ? "Cette photo est déjà validée." : "Cette photo n'est pas validée.",
      });
    }

    await eventModel.setDecorPictureValidation(eventId, decorId, userId, validated);
    res.status(200).json({ message: validated ? "Photo du décor validée." : "Validation annulée." });
  } catch (error) {
    console.error("Erreur validateDecorPicture :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function validateDecorInstall(req, res) {
  try {
    const { eventId, decorId } = req.params;
    const validated = normalizeValidated(req.body.validated);
    const userId = req.user.user_id;

    const line = await eventModel.getEventDecor(eventId, decorId);
    if (!line) {
      return res.status(404).json({ message: "Ce décor n'est pas rattaché à cet événement." });
    }
    if (Boolean(line.install_validated) === validated) {
      return res.status(409).json({
        message: validated ? "Cette installation est déjà validée." : "Cette installation n'est pas validée.",
      });
    }

    await eventModel.setDecorInstallValidation(eventId, decorId, userId, validated);
    res.status(200).json({ message: validated ? "Installation du décor validée." : "Validation annulée." });
  } catch (error) {
    console.error("Erreur validateDecorInstall :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function validateDecorUninstall(req, res) {
  try {
    const { eventId, decorId } = req.params;
    const validated = normalizeValidated(req.body.validated);
    const userId = req.user.user_id;

    const line = await eventModel.getEventDecor(eventId, decorId);
    if (!line) {
      return res.status(404).json({ message: "Ce décor n'est pas rattaché à cet événement." });
    }
    if (Boolean(line.uninstall_validated) === validated) {
      return res.status(409).json({
        message: validated ? "Cette désinstallation est déjà validée." : "Cette désinstallation n'est pas validée.",
      });
    }

    await eventModel.setDecorUninstallValidation(eventId, decorId, userId, validated);
    res.status(200).json({ message: validated ? "Désinstallation du décor validée." : "Validation annulée." });
  } catch (error) {
    console.error("Erreur validateDecorUninstall :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, validateArticlePicture, validateDecorPicture, validateDecorInstall, validateDecorUninstall };