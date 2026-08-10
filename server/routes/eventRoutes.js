const express = require("express");
const router = express.Router();
const eventController = require("./../controllers/eventController");
const { verifyToken } = require("./../middlewares/authMiddleware");
const { verifyRole } = require("./../middlewares/roleMiddleware");

router.get("/", verifyToken, verifyRole("admin"), eventController.getAllEvents);
router.get("/:id", verifyToken, verifyRole("admin"), eventController.getEventById);
router.post("/", verifyToken, verifyRole("admin"), eventController.createEvent);
router.put("/:id", verifyToken, verifyRole("admin"), eventController.updateEvent);
router.delete("/:id", verifyToken, verifyRole("admin"), eventController.deleteEvent);

// Valider la photo d'un article => photographes (et admin)
router.patch(
  "/:eventId/articles/:articleId/validate-picture",
  verifyToken,
  verifyRole("admin", "photographe", "assistant_photographe"),
  eventController.validateArticlePicture
);

// Valider la photo d'un décor — photographes (et admin)
router.patch(
  "/:eventId/decors/:decorId/validate-picture",
  verifyToken,
  verifyRole("admin", "photographe", "assistant_photographe"),
  eventController.validateDecorPicture
);

// Valider l'installation d'un décor — décorateurs (et admin)
router.patch(
  "/:eventId/decors/:decorId/validate-install",
  verifyToken,
  verifyRole("admin", "decorateur", "assistant_decorateur"),
  eventController.validateDecorInstall
);

// Valider la désinstallation d'un décor — décorateurs (et admin)
router.patch(
  "/:eventId/decors/:decorId/validate-uninstall",
  verifyToken,
  verifyRole("admin", "decorateur", "assistant_decorateur"),
  eventController.validateDecorUninstall
);

module.exports = router;