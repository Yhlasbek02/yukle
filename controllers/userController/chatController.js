const {Message, Chat, User, adminMessage} = require("../../models/models");

class ChatController {
    async addMessage(req, res) {
        try {
            const {text} = req.body;
            const newMessage = await Message.create({
                text: text,
                senderId: req.user.id
            });
            res.status(200).json({message: "Message sent successfully", newMessage});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in add message"});
        }
    }

    async getMessages (req, res) {
        try {
            const id = req.user.id;
            let messages = await Message.findAll({
                where: {senderId: id},
                order: [['id', 'DESC']],
            });
            if (!messages) {
                messages = []
            }
            let adminMessages = await adminMessage.findAll({
                where: {receiverId: id},
                order: [['id', 'DESC']]
            }) || [];
            res.status(200).json({messages, adminMessages});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting messages"});
        }
    }
}

module.exports = ChatController;
