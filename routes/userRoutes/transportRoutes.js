const express = require("express");
const router = express.Router();
const transportController = require("../../controllers/userController/transportController");
const controllers = new transportController();

router.get("/get-types/:lang", controllers.getTransportTypes);
router.post("/add:lang", controllers.addTransport);
router.get("/:lang", controllers.getTransports);
router.get("/my/:lang", controllers.myTransport);



module.exports = router;