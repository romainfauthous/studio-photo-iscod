const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const { verifyToken } = require("./../middlewares/authMiddleware");

// POST /api/auth/login
router.post("/login", authController.login);

// Route protégée de test : renvoie les infos de l'utilisateur connecté
router.get("/me", verifyToken, (req, res) => {
  res.json({ message: "Accès autorisé", user: req.user });
});

module.exports = router;