const {User, Cargo, Transport} = require("../../models/models");

class UserController {
    async getAllUsers (req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.pageSize || 15;
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const {searchKey} = req.query;
            let queryOptions = {
                limit: parseInt(limit),
                offset,
            };
            if (searchKey) {
                queryOptions.where = {
                    email: {
                        [Op.like]: `%${searchKey}%`
                    }
                };
            }
            const { count, rows: users } = await User.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                users,
                totalPages,
                totalCountry: count,
                currentPage: page
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting all users"});
        }
    }

    async getUser (req, res) {
        try {
            const {id} = req.params;
            const user = await User.findOne(
                {where: {uuid: id}},
                {include: [
                    {model: Cargo, as: 'cargos'},
                    {model: Transport, as: 'transports'}
                ]}
            );
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }
            res.status(200).json({user});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting specific user"});
        }
    }

    async deleteUser (req, res) {
        try {
            const {id} = req.params;
            const user = await User.findOne(
                {where: {uuid: id}},
                {
                    include: [
                        {model: Transport, as: 'transports'},
                        {model: Cargo, as: 'cargos'}
                    ]
                }
            );

            if (!user) {
                return res.status(404).json({message: "User not found"});
            };

            const transports = user.transports;
            const cargos = user.cargos;
            await Promise.all([
                ...transports.map(transport => transport.destroy()),
                ...cargos.map(cargo => cargo.destroy())
            ]);
            await user.destroy();
            return res.status(200).json({message: "User deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({messsage: "Error in deleting user"});
        }
    }
}

module.exports = UserController;