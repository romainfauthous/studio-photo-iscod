const express = require("express");
const router = express.Router();
const historyController = require("./../controllers/historyController");
const { verifyToken } = require("./../middlewares/authMiddleware");
const { verifyRole } = require("./../middlewares/roleMiddleware");

// Tous les historiques : admin uniquement
router.get("/work", verifyToken, verifyRole("admin"), historyController.getWorkHistory);
router.get("/work/user/:userId", verifyToken, verifyRole("admin"), historyController.getWorkHistoryByUser);
router.get("/articles", verifyToken, verifyRole("admin"), historyController.getPhotographedArticles);
router.get("/decors", verifyToken, verifyRole("admin"), historyController.getPhotographedDecors);

module.exports = router;