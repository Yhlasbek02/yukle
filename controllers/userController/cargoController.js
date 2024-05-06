const { User, Cargo, CargoType, TransportType, country, city, Transport, Notifications } = require("../../models/models");
const { Op } = require("sequelize");
const sendNotification = require("../adminInitialize");
class CargoController {
    async getCargoTypes(req, res) {
        try {
            const { lang } = req.params;
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            const types = await CargoType.findAll({
                attributes: attributes[lang] || {}
            });
            if (!types || types.length === 0) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Cargo types not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargo types not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Cargo types not found" });
                }
            }
            res.status(200).json({ types });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting cargo types" });
        }
    }

    
    

    async addCargo(req, res) {
        async function sendNotificationsAfterResponse(tokens, uuid, type) {
            const notificationPromises = tokens.map((token) =>
                sendNotification(token, `cargo/${uuid}`, 'New cargo added', `${uuid}`, type)
            );
        
            try {
                await Promise.all(notificationPromises);
                console.log("Notifications sent successfully");
            } catch (error) {
                console.error("Notification error:", error);
            }
        }
        try {
            const { lang } = req.params;
            const {
                typeId,
                fromCountry,
                fromCity,
                toCountry,
                toCity,
                weight,
                typeTransport,
                phoneNumber,
                name,
                email,
                whatsApp,
                additional_info
            } = req.body;
            
            if (!typeId || !fromCity || !fromCountry || !toCountry || !toCity || !weight || !name) {
                if (!phoneNumber && !email) {
                    if (lang === "en") {
                        return res.status(409).json({ message: "Fields are required" });
                    } if (lang === "ru") {
                        return res.status(409).json({ message: "Fields are required" });
                    } if (lang === "tr") {
                        return res.status(409).json({ message: "Fields are required" });
                    }
                }
            }
            const userId = req.user.id;
            const newCargo = await Cargo.create({
                typeId: typeId,
                fromCountry: fromCountry,
                fromCity: fromCity,
                toCountry: toCountry,
                toCity: toCity,
                typeTransport,
                weight,
                phoneNumber,
                email,
                name,
                whatsApp: whatsApp,
                userId: userId,
                additional_info
            });
            console.log(req.body);
            const transports = await Transport.findAll({ where: { locationCountry: fromCountry, userId: { [Op.ne]: userId } } });
            console.log("transports:", transports);
            const notificationTokens = [];
            const userIds = []

            for (const transport of transports) {
                const user = await User.findOne({ where: { id: transport.userId }});
                console.log("user:", user.dataValues);
                if (user.fcm_token && user.cargoNotification && !notificationTokens.includes(user.fcm_token)) {
                    userIds.push(user.id);
                    console.log("fcm_token:", user.fcm_token)
                    notificationTokens.push(user.fcm_token);
                    console.log("Added");
                } else {
                    console.log(`${user.email} has no fcm_token`);
                }
            }
            if (lang === "en") {
                res.status(200).json({ message: "Cargo added successfully", newCargo });
            } else if (lang === "ru") {
                res.status(200).json({ message: "Груз успешно добавлен", newCargo });
            } else if (lang === "tr") {
                res.status(200).json({ message: "Yük başarıyla eklendi", newCargo });
            }
            try {
                console.log("this is notification part");
                const notification = await Notifications.create({
                    userIds: userIds,
                    body: "New Cargo",
                    url: `cargo/${newCargo.uuid}`,
                    type: 'cargo'
                })
                console.log("new notification:", notification);
                await sendNotificationsAfterResponse(notificationTokens, `${newCargo.uuid}`, "cargo");    
            } catch (error) {
                console.error(error);
            }
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Cargo adding error" })
        }
    }

    async getCargos(req, res) {
        try {
            const { lang } = req.params;
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 20;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            const filters = {
                typeId: req.query.type,
                fromCountry: req.query.from,
                toCountry: req.query.to,
                weight: { [Op.lte]: parseInt(req.query.weight) }
            };

            Object.keys(filters).forEach((key) => {
                if (filters[key] === undefined || filters[key] === "") {
                    delete filters[key];
                }
            });
            const totalCount = await Cargo.count({
                where: filters
            });
            let cargos = await Cargo.findAll({
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
                        model: CargoType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "from_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "to_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "from_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "to_city",
                        attributes: attributes[lang]
                    }
                ]
            });
            for (const single of cargos) {
                let transportTypes = [];
                for (const typeId of single.typeTransport) {
                    const type = await TransportType.findByPk(typeId);
                    if (type) {
                        if (lang === "en") {
                            transportTypes.push(type.nameEn);
                        } if (lang === "ru") {
                            transportTypes.push(type.nameRu);
                        } if (lang === "tr") {
                            transportTypes.push(type.nameTr);
                        }
                    }
                }
                console.log(transportTypes);
                single.typeTransport = transportTypes;
            }

            if (cargos.length === 0) {
                cargos = []
                if (lang === "en") {
                    return res.status(200).json({ cargos });
                } if (lang === "ru") {
                    return res.status(200).json({ cargos });
                } if (lang === "tr") {
                    return res.status(200).json({ cargos });
                }
            };

            res.status(200).json({
                cargos,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting cargos" });
        }
    }

    async getMyCargos(req, res) {
        try {
            const { lang } = req.params;
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 20;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const userId = req.user.id;
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            let cargos = await Cargo.findAll({
                offset,
                limit: parseInt(pageSize),
                order: [[sort, sortOrder]],
                where: { userId: userId },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: attributes[lang]
                    },
                    {
                        model: CargoType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "from_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "to_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "from_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "to_city",
                        attributes: attributes[lang]
                    }
                ]
            });
            console.log(cargos);
            for (const single of cargos) {
                const transportTypes = [];
                for (const typeId of single.typeTransport) {
                    const type = await TransportType.findByPk(typeId);
                    if (type) {
                        if (lang === "en") {
                            transportTypes.push(type.nameEn);
                        } if (lang === "ru") {
                            transportTypes.push(type.nameRu);
                        } if (lang === "tr") {
                            transportTypes.push(type.nameTr);
                        }
                    }
                }
                single.typeTransport = transportTypes;
            }
            if (cargos.length === 0) {
                cargos = []
                if (lang === "en") {
                    return res.status(200).json({ cargos });
                } if (lang === "ru") {
                    return res.status(200).json({ cargos });
                } if (lang === "tr") {
                    return res.status(200).json({ cargos });
                }
            }
            res.status(200).json({ cargos });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting my cargos" });
        }
    }

    async specificCargo(req, res) {
        try {
            console.log(req.params);
            const { id, lang } = req.params;
            console.log(id);
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            const cargo = await Cargo.findOne({
                where: { uuid: id },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: attributes[lang]
                    },
                    {
                        model: CargoType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "from_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "to_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "from_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "to_city",
                        attributes: attributes[lang]
                    }
                ]
            });
            console.log(cargo.dataValues)
            if (!cargo) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargos not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Cargos not found" });
                }
            }
            res.status(200).json({ cargo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in editing cargo" });
        }
    }

    async deleteCargo(req, res) {
        try {
            const { id, lang } = req.params;
            const cargo = await Cargo.findOne({ where: { uuid: id } });
            if (!cargo) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargos not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Cargos not found" });
                }
            }
            await cargo.destroy();
            if (lang === "en") {
                return res.status(200).json({ message: "Cargo deleted successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Cargo deleted successfully" });
            } if (lang === "tr") {
                return res.status(200).json({ message: "Cargo deleted successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in deleting cargo" });
        }
    }
}

module.exports = CargoController;

