const express = require("express");
const router = express.Router();
const articleController = require("./../controllers/articleController");
const { verifyToken } = require("./../middlewares/authMiddleware");
const { verifyRole } = require("./../middlewares/roleMiddleware");

router.get("/", verifyToken, verifyRole("admin"), articleController.getAllArticles);
router.get("/:id", verifyToken, verifyRole("admin"), articleController.getArticleById);
router.post("/", verifyToken, verifyRole("admin"), articleController.createArticle);
router.put("/:id", verifyToken, verifyRole("admin"), articleController.updateArticle);
router.delete("/:id", verifyToken, verifyRole("admin"), articleController.deleteArticle);

module.exports = router;