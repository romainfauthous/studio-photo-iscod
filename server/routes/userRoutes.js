const express = require("express");
const router = express.Router();
const userController = require("./../controllers/userController");
const { verifyToken } = require("./../middlewares/authMiddleware");
const { verifyRole } = require("./../middlewares/roleMiddleware");

// Lister tous les utilisateurs — admin uniquement
router.get("/", verifyToken, verifyRole("admin"), userController.getAllUsers);

// Récupérer un utilisateur par son id — admin uniquement
router.get("/:id", verifyToken, verifyRole("admin"), userController.getUserById);

// Créer un utilisateur — admin uniquement
router.post("/", verifyToken, verifyRole("admin"), userController.createUser);

// Modifier un utilisateur - admin uniquement
router.put("/:id", verifyToken, verifyRole("admin"), userController.updateUser);

// Supprimer un utilisateur - admin uniquement
router.delete("/:id", verifyToken, verifyRole("admin"), userController.deleteUser);

module.exports = router;