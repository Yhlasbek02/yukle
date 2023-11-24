const { User, Transport, TransportType, country, city } = require("../../models/models");
const { Op } = require("sequelize");

class transportController {
    async getTransportTypes(req, res) {
        try {
            const {lang} = req.params;
            const attributes = {
                en: { exclude: ['nameRu', 'nameTr'] },
                ru: { exclude: ['nameEn', 'nameTr'] },
                tr: { exclude: ['nameEn', 'nameRu'] },
            };
            const types = await TransportType.findAll({
                attributes: attributes[lang] || {}
            });
            if (!types || types.length === 0) {
                if (lang === "en"){
                    return res.status(404).json({ message: "Transport types not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Transport types not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Transport types not found" });
                }
                
            }
            res.status(200).json({ types });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting transport types" });
        }
    }


    async addTransport(req, res) {
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
                whatsApp } = req.body;
            if (!typeId || !belongsTo || !locationCountry || !locationCity || !name || !phoneNumber || !email) {
                if (lang === "en"){
                    return res.status(404).json({ message: "Fields are required" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Fields are required" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Fields are required" });
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
                userId: userId
            });
            if (lang === "en"){
                return res.status(200).json({ message: "Transport added successfully", newTransport });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Transport added successfully", newTransport });
            } if (lang === "tr") {
                return res.status(200).json({ message: "Transport added successfully", newTransport });
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
            const pageSize = req.query.pageSize || 20;

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
                return res.status(404).json({ transports});
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
            const pageSize = req.query.pageSize || 20;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const id = req.user.id;
            const totalCount = await Transport.count({
                where: {userId: id}
            });
            const transport = await Transport.findAll({
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
            for (const single of transport) {
                const desiredDirectionCountries = [];
                for (const directionId of single.desiredDirection) {
                    const directionCountry = await country.findByPk(directionId);
                    if (directionCountry) {
                        desiredDirectionCountries.push(directionCountry.nameEn);
                    }
                }
                single.desiredDirection = desiredDirectionCountries;
            }
            if (transport.length === 0) {
                if (lang === "en"){
                    return res.status(404).json({ message: "Transports not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Transports not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Transports not found" });
                }
            }
            res.status(200).json({
                transport,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize) 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting my transport" })
        }
    }

    async editTransport(req, res) {
        try {
            const { id, lang } = req.params;
            const transport = await Transport.findOne({ where: { uuid: id } });
            if (!transport) {
                if (lang === "en"){
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Cargo not found" });
                }
                
            }
            await transport.update(req.body);
            if (lang === "en"){
                return res.status(200).json({ message: "Cargo successfully edited", transport });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Cargo successfully edited", transport });
            } if (lang === "tr") {
                return res.status(200).json({ message: "Cargo successfully edited", transport });
            }
            
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
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Cargo not found" });
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