const { User, Transport, TransportType, country, city, Cargo, Notifications } = require("../../models/models");
const { Op } = require("sequelize");
const sendNotification = require("../adminInitialize");

class transportController {
    async getTransportTypes(req, res) {
        try {
            const {lang} = req.params;
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            let types = await TransportType.findAll({
                attributes: attributes[lang] || {}
            });
            if (!types || types.length === 0) {
                types = []
                if (lang === "en"){
                    return res.status(200).json({ types });
                } if (lang === "ru") {
                    return res.status(200).json({ types });
                } if (lang === "tr") {
                    return res.status(200).json({ types });
                }
                
            }
            res.status(200).json({ types });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting transport types" });
        }
    }


    async addTransport(req, res) {
        async function sendNotificationsAfterResponse(tokens, uuid) {
            const notificationPromises = tokens.map((token) =>
                sendNotification(token, `transport/${uuid}`, 'New transport added')
            );
        
            try {
                await Promise.all(notificationPromises);
                console.log("Notifications sent successfully");
            } catch (error) {
                console.error("Notification error:", error);
            }
        }
        try {
            const {lang} = req.params;
            const {
                typeId,
                belongsTo,
                locationCountry,
                locationCity,
                name,
                phoneNumber,
                email,
                desiredDirection,
                whatsApp,
                additional_info
             } = req.body; 
            if (!typeId || !belongsTo || !locationCountry || !name) {
                if (!phoneNumber && !email) {
                    if (lang === "en"){
                        return res.status(404).json({ message: "Fields are required" });
                    } if (lang === "ru") {
                        return res.status(404).json({ message: "Fields are required" });
                    } if (lang === "tr") {
                        return res.status(404).json({ message: "Fields are required" });
                    }
                }
            }
            const userId = req.user.id;
            const newTransport = await Transport.create({
                belongsTo,
                locationCountry,
                locationCity,
                desiredDirection: desiredDirection,
                typeId: typeId,
                whatsApp,
                email,
                phoneNumber,
                name,
                userId: userId,
                additional_info
            });
            const cargos = await Cargo.findAll({where: {fromCountry: locationCountry}})
            const notificationTokens = [];
            const userIds = []

            for (const cargo of cargos) {
                const user = await User.findOne({ where: { id: cargo.userId } });
                console.log(user.dataValues);
                if (user.fcm_token && user.transportNotification && !notificationTokens.includes(user.fcm_token)) {
                    userIds.push(user.id);
                    notificationTokens.push(user.fcm_token);
                }
            }


            if (lang === "en"){
                res.status(200).json({ message: "Transport added successfully", newTransport });
            } else if (lang === "ru") {
                res.status(200).json({ message: "Transport added successfully", newTransport });
            } else if (lang === "tr") {
                res.status(200).json({ message: "Transport added successfully", newTransport });
            }
            try {
                console.log("this is notification part");
                const notification = await Notifications.create({
                    userIds: userIds,
                    body: "New Transport",
                    url: `transport/${newTransport.uuid}`
                })
                console.log(notification);
                await sendNotificationsAfterResponse(notificationTokens, `${newTransport.uuid}`);    
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in adding transport" });
        }
    }

    async getTransports(req, res) {
        try {
            const {lang} = req.params;
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 12;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const filters = {
                typeId: req.query.type,
                locationCountry: req.query.location,
                belongsTo: req.query.country,
                // desiredLocation: {
                //     [Op.contains]: desiredLocation
                // }
            };

            Object.keys(filters).forEach((key) => {
                if (filters[key] === undefined || filters[key] === "") {
                    delete filters[key];
                }
            });
            const totalCount = await Transport.count({
                where: filters
            });
            let transports = await Transport.findAll({
                offset,
                limit: parseInt(pageSize),
                where: {
                    ...filters,
                    userId: {
                        [Op.ne]: req.user.id
                    }
                },
                order: [[sort, sortOrder]],
                include: [
                    {
                        model: User,
                        as: "user"
                    },
                    {
                        model: TransportType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "affiliation_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "location_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "location_city",
                        attributes: attributes[lang]
                    },
                ]
            });
            for (const single of transports) {
                const desiredDirectionCountries = [];
                for (const directionId of single.desiredDirection) {
                    const directionCountry = await country.findByPk(directionId);
                    if (directionCountry) {
                        desiredDirectionCountries.push(directionCountry.nameEn);
                    }
                }
                single.desiredDirection = desiredDirectionCountries;
            }
            if (transports.length === 0) {
                transports = []
                return res.status(200).json({ transports});
            };
            res.status(200).json({
                transports,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize)
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting transports" });
        }
    }

    async myTransport(req, res) {
        try {
            const {lang} = req.params;
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 12;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const id = req.user.id;
            const totalCount = await Transport.count({
                where: {userId: id}
            });
            let transports = await Transport.findAll({
                offset,
                limit: parseInt(pageSize),
                order: [[sort, sortOrder]],
                where: { userId: id },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: {exclude: ['password']}
                    },
                    {
                        model: TransportType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "affiliation_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "location_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "location_city",
                        attributes: attributes[lang]
                    },
                ]
            });
            for (const single of transports) {
                const desiredDirectionCountries = [];
                for (const directionId of single.desiredDirection) {
                    const directionCountry = await country.findByPk(directionId);
                    if (directionCountry) {
                        desiredDirectionCountries.push(directionCountry.nameEn);
                    }
                }
                single.desiredDirection = desiredDirectionCountries;
            }
            if (transports.length === 0) {
                transports = []
                if (lang === "en"){
                    return res.status(200).json({ transports });
                } if (lang === "ru") {
                    return res.status(200).json({ transports });
                } if (lang === "tr") {
                    return res.status(200).json({ transports });
                }
            }
            res.status(200).json({
                transports,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize) 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting my transport" })
        }
    }

    async specificTransport(req, res) {
        try {
            const { id, lang } = req.params;
            const transport = await Transport.findOne({ 
                where: { uuid: id },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: {exclude: ['password']}
                    },
                    {
                        model: TransportType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "affiliation_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "location_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "location_city",
                        attributes: attributes[lang]
                    },

                ]
            });
            if (!transport) {
                if (lang === "en"){
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Transport not found" });
                }
                
            }
            
            res.status(200).json({ transport });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in editing cargo" });
        }
    }

    async deleteTransport(req, res) {
        try {
            const { id, lang } = req.params;
            const transport = await Transport.findOne({ where: { uuid: id } });
            if (!transport) {
                if (lang === "en"){
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Transport not found" });
                }
            }
            await transport.destroy();
            if (lang === "en"){
                return res.status(200).json({ message: "Transport deleted successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Transport deleted successfully" });
            } if (lang === "tr") {
                return res.status(200).json({ message: "Transport deleted successfully" });
            }
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in deleting transport" });
        }
    }
}

module.exports = transportController;