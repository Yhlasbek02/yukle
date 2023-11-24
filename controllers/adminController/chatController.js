const {User, adminMessage, Message} = require("../../models/models");

class chatController {
    async addMessage (req, res) {
        try {
            const {id} = req.params;
            const {text} = req.body;
            const userMessage = await Message.findOne({where: {id: id}});
            if (!userMessage) {
                return res.status(404).json({message: "Message not found"});
            }
            const newMessage = await adminMessage.create({
                text: text,
                receiverId: userMessage.senderId
            });
            res.status(200).json({newMessage});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "error in admin add message"});
        }
    }

    async getAllMessages (req, res) {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 20;
    
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const totalMessages = await Message.count();
            let messages = await Message.findAll({
                offset,
                limit: parseInt(pageSize),
                order: [['id', 'DESC']],
                include: [
                    {
                        model: User,
                        as: 'sender'
                    }
                ]
            });
            res.status(200).json({
                messages,
                totalMessages,
                currentPage: page,
                totalPages: Math.ceil(totalMessages/pageSize)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting messages"});
        }
    }

    async getSpecificMessage (req, res) {
        try {
            const {id}= req.params;
            const message = await Message.findOne({where: {senderId: id}});
            let adminMessages = await adminMessage.findAll({where: {receiverId: id}});
            if (!message) {
                return res.status(404).json({message: "Message not found"});
            }
            if (!adminMessages) {
                adminMessages = []
            }
            res.status(200).json({message, adminMessages});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting specific message:"});
        }
    }
}

module.exports = chatController;