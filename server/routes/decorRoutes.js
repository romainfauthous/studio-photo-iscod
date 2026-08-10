const express = require("express");
const router = express.Router();
const decorController = require("./../controllers/decorController");
const { verifyToken } = require("./../middlewares/authMiddleware");
const { verifyRole } = require("./../middlewares/roleMiddleware");

router.get("/", verifyToken, verifyRole("admin"), decorController.getAllDecors);
router.get("/:id", verifyToken, verifyRole("admin"), decorController.getDecorById);
router.post("/", verifyToken, verifyRole("admin"), decorController.createDecor);
router.put("/:id", verifyToken, verifyRole("admin"), decorController.updateDecor);
router.delete("/:id", verifyToken, verifyRole("admin"), decorController.deleteDecor);

module.exports = router;