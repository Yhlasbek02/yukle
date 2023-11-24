const express = require("express");
const router = express.Router();
const CargoController = require("../../controllers/userController/cargoController");
const controllers = new CargoController();

router.get("/get-types", controllers.getCargoTypes);
router.post("/add/:lang", controllers.addCargo);
router.get("/:lang", controllers.getCargos);
router.get("/my/:lang", controllers.getMyCargos);


module.exports = router;