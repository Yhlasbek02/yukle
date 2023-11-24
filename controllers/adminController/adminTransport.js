const {Transport, User, TransportType, country, city} = require("../../models/models");

class TransportController {
    async getTransports (req, res) {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 15;
    
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const transports = await Transport.findAndCountAll({
                offset,
                limit: parseInt(pageSize),
                order: [[sort, sortOrder]],
                include: [
                    {
                        model: User,
                        as: "user"
                    },
                    {
                        model: TransportType,
                        as: "type"
                    },
                    {
                        model: country,
                        as: "affiliation_country"
                    },
                    {
                        model: country,
                        as: "location_country"
                    },
                    {
                        model: city,
                        as: "location_city"
                    },
                ]
            });
            let totalTransport = transports.count;
            if (!transports || transports.length === 0) {
                return res.status(404).json({error: "Transports not found"});
            }
            res.status(200).json({
                transports,
                totalTransport,
                currentPage: page,
                totalPages: Math.ceil(totalTransport / pageSize)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting transports"});
        }
    }

    async getTransport (req, res) {
        try {
            const {id} = req.params;
            const transport = await Transport.findOne({
                where: {uuid: id},
                include: [
                    {
                        model: User,
                        as: "user"
                    },
                    {
                        model: TransportType,
                        as: "type"
                    },
                    {
                        model: country,
                        as: "affiliation_country"
                    },
                    {
                        model: country,
                        as: "location_country"
                    },
                    {
                        model: city,
                        as: "location_city"
                    },
                ]
            });
            if (!transport) {
                return res.status(404).json({message: "Transport not found"});
            };
            res.status(200).json({transport});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting transport"});
        }
    }

    async deleteTransport (req, res) {
        try {
            const {id} = req.params;
            const transport = await Transport.findOne({where: {uuid: id}});
            if (!transport) {
                return res.status(404).json({message: "Transport not found"});
            };
            await transport.destroy();
            res.status(200).json({message: "Transport successfully deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in deleting transport"});
        }
    }
}

module.exports = TransportController;