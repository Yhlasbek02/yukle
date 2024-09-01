const { User, Notifications, Cargo, Transport, country, city, CargoType, TransportType } = require("../../models/models");
const { Op, Sequelize, where } = require("sequelize")

class notificationController {
    async getNotifications(req, res) {
        try {
            const { id } = req.user;
            const { lang } = req.params;
            const user = await User.findOne({ where: { id } });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const { page = 1, pageSize = 10, sort = 'createdAt', order = 'DESC' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(pageSize);

            const { count: totalCount, rows: notifications } = await Notifications.findAndCountAll({
                where: {
                    userIds: {
                        [Op.not]: [[]]
                    }
                },
                order: [[sort, order]],
                limit: parseInt(pageSize),
                offset
            });
            const data = []

            // Fetch cargo or transport information for each notification
            for (const notification of notifications) {
                const attributes = {
                    en: [[Sequelize.col('nameEn'), 'name']],
                    ru: [[Sequelize.col('nameRu'), 'name']],
                    tr: [[Sequelize.col('nameTr'), 'name']],
                };
                const uuid = notification.url.split('/')[1];
                const entityType = notification.url.split('/')[0]; // Extracting whether it's cargo or transport
                let entityInfo;

                if (entityType === 'cargo') {
                    entityInfo = await Cargo.findOne({
                        where: { uuid },
                        include: [
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
                } else if (entityType === 'transport') {
                    entityInfo = await Transport.findOne({
                        where: { uuid },
                        include: [
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
                }

                // If entityInfo is not null, serialize it before assigning
                notification.dataValues.extraInfo = entityInfo ? entityInfo.toJSON() : null;
                console.log(notification);
                data.push(notification)
            }

            const totalPages = Math.ceil(totalCount / pageSize);

            res.status(200).json({ data, totalCount, currentPage: parseInt(page), totalPages });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getWebNotifications(req, res) {
        try {
            const { lang } = req.params;
            const { type, page = 1, pageSize = 10, sort = 'createdAt', order = 'DESC' } = req.query;
            const user = await User.findOne({ where: { id: req.user.id } });
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const attributes = {
                en: [[Sequelize.col('nameEn'), 'name']],
                ru: [[Sequelize.col('nameRu'), 'name']],
                tr: [[Sequelize.col('nameTr'), 'name']],
            };
            const whereClause = {
                userIds: {
                    [Op.contains]: [user.id]
                }
            };

            if (type) {
                whereClause.type = type;
            }

            const { count: totalCount, rows: notifications } = await Notifications.findAndCountAll({
                where: whereClause,
                order: [[sort, order]],
                limit: parseInt(pageSize),
                offset
            });

            // Fetch related Transport or Cargo based on notification type and URL
            const detailedNotifications = await Promise.all(notifications.map(async (notification) => {
                const uuid = notification.url.split('/').pop();
                let relatedEntity = null;

                if (notification.type === 'transport') {
                    relatedEntity = await Transport.findOne({
                        where: { uuid },
                        include: [
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
                } else if (notification.type === 'cargo') {
                    relatedEntity = await Cargo.findOne({
                        where: { uuid },
                        include: [
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
                }

                return {
                    ...notification.toJSON(), // Convert Sequelize instance to plain object
                    relatedEntity
                };
            }));

            res.status(200).json({ notifications: detailedNotifications, totalCount, currentPage: parseInt(page), totalPages: Math.ceil(totalCount / pageSize) });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

}

module.exports = notificationController;