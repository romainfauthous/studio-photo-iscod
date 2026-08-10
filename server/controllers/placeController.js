const placeModel = require("./../models/placeModel");

const ALLOWED_TYPES = ["studio", "maison"];

async function getAllPlaces(req, res) {
  try {
    const places = await placeModel.findAll();
    res.json(places);
  } catch (error) {
    console.error("Erreur getAllPlaces :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function getPlaceById(req, res) {
  try {
    const { id } = req.params;
    const place = await placeModel.findById(id);
    if (!place) {
      return res.status(404).json({ message: "Lieu introuvable." });
    }
    res.json(place);
  } catch (error) {
    console.error("Erreur getPlaceById :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function createPlace(req, res) {
  try {
    const { name, adress, type } = req.body;

    if (!name?.trim() || !adress?.trim() || !type?.trim()) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: "Type de lieu invalide (studio ou maison)." });
    }

    const newId = await placeModel.create({
        name: name.trim(),
        adress: adress.trim(),
        type,
    });
    res.status(201).json({ message: "Lieu créé avec succès.", place_id: newId });
  } catch (error) {
    console.error("Erreur createPlace :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function updatePlace(req, res) {
  try {
    const { id } = req.params;
    const { name, adress, type } = req.body;

    const existing = await placeModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Lieu introuvable." });
    }
    if (!name?.trim() || !adress?.trim() || !type?.trim()) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: "Type de lieu invalide (studio ou maison)." });
    }

    await placeModel.update(id, {
        name: name.trim(),
        adress: adress.trim(),
        type,
    });
    const updated = await placeModel.findById(id);
    res.status(200).json({ message: "Lieu mis à jour.", place: updated });
  } catch (error) {
    console.error("Erreur updatePlace :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

async function deletePlace(req, res) {
  try {
    const { id } = req.params;
    const existing = await placeModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Lieu introuvable." });
    }
    await placeModel.remove(id);
    res.status(200).json({ message: "Lieu supprimé." });
  } catch (error) {
    console.error("Erreur deletePlace :", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

module.exports = { getAllPlaces, getPlaceById, createPlace, updatePlace, deletePlace };