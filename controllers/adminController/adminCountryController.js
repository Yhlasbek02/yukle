const {country, country} = require("../../models/models");

class CountryController {
    async getCountry (req, res) {
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
                    country: {
                        [Op.like]: `%${searchKey}%`
                    }
                };
            }
            const { count, rows: countries } = await country.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                countries,
                totalPages,
                totalCountry: count,
                currentPage: page
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error in getting countries'});
        }
    }

    async deleteCountry (req, res) {
        try {
            const {id} = req.params;
            const countryData = await country.findOne({where: {uuid: id}});
            if (!countryData) {
                return res.status(404).json({message: "Country not found"});
            }
            await countryData.destroy();
            res.status(200).json({message: "Country deleted successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in deleting country"});
        }
    }

    async editCountry (req, res) {
        try {
            const {id} = req.params;
            const {country} = req.body;
            const countryData = await country.findOne({where: {uuid: id}});
            if (!countryData) {
                return res.status(404).json({message: "Country not found"});
            }
            countryData.country = country;
            res.status(200).json({message: "Country edited successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in editing country"});
        }
    }

    async addCity (req, res) {
        try {
            const {id} = req.params;
            const {city} = req.body;
            const countryData = await country.findOne({where: {uuid: id}});
            if (!countryData) {
                return res.status(404).json({message: "Country not found"});
            }
            const updatedCountry = await country.update({
                cities: [...countryData.cities, city]
            });
            res.status(200).json({message: 'City successfully added', updatedCountry});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in adding city"});
        }
    }
}

module.exports = CountryController;