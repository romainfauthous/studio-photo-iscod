const express = require("express");
const router = express.Router();
const placeController = require("./../controllers/placeController");
const { verifyToken } = require("./../middlewares/authMiddleware");
const { verifyRole } = require("./../middlewares/roleMiddleware");

router.get("/", verifyToken, verifyRole("admin"), placeController.getAllPlaces);
router.get("/:id", verifyToken, verifyRole("admin"), placeController.getPlaceById);
router.post("/", verifyToken, verifyRole("admin"), placeController.createPlace);
router.put("/:id", verifyToken, verifyRole("admin"), placeController.updatePlace);
router.delete("/:id", verifyToken, verifyRole("admin"), placeController.deletePlace);

module.exports = router;