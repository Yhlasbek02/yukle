const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/userController//messageController");

router.post("/create-chat", controllers.createChat);
router.post("/add-message/:chatId", controllers.addMessage);
router.get("/chats", controllers.getChats);
router.get("/messages/:chatId", controllers.getMessages);
router.delete("/delete-message/:id", controllers.deleteMessage);
router.delete("/delete-chat/:id", controllers.deleteChat);

module.exports = router;