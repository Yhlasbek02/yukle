const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/userController/lastNotifications");
const controllers = new notificationController();
router.get("/:lang", controllers.getNotifications);

module.exports= router;