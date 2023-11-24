const {TransportType} = require("../../models/models");

class TransportTypeController {
    async addTransportType (req, res) {
        try {
            const {nameEn, nameRu, nameTr} = req.body;
            const newTransportType = await TransportType.create({nameEn, nameRu, nameTr});
            res.status(200).json({message: "Transport type added", newTransportType});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to add transport type"});
        }
    }

    async editTransportType (req, res) {
        try {
            const {id} = req.params;
            const {nameEn, nameRu, nameTr} = req.body;
            const transportType = await TransportType.findOne({where: {uuid: id}});
            if (!transportType) {
                return res.status(404).json({message: "Transport type not found"});
            }
            transportType.nameEn = nameEn;
            transportType.nameRu = nameRu;
            transportType.nameTr = nameTr;
            await transportType.save();
            res.status(200).json({message: "Transport type edited successfully", transportType});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to edit transport type"});
        }
    }

    async deleteTransportType (req, res) {
        try {
            const {id} = req.params;
            const transportType = await TransportType.findOne({where: {uuid: id}});
            if (!transportType) {
                return res.status(404).json({message: "Transport type not found"});
            }
            await transportType.destroy();
            res.status(200).json({message: "Transport type successfully deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to delete transport type"});
        }
    }

    async getAllTransportType (req, res) {
        try {
            const transportTypes = await TransportType.findAll({});
            res.status(200).json({transportTypes});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Failed to get transport types'});
        }
    }
}

module.exports = TransportTypeController;