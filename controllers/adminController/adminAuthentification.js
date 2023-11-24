const {Admin} = require("../../models/models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AdminAuthentification {
    async registerAdmin (req, res) {
        const {username, email, password, password_conf} = req.body;
        const admin = await Admin.findOne({where: {email: email}});
        if (admin) {
            return res.status(409).send({message: "Admin already exists"});
        }
        if (!username || !email || !password || !password_conf) {
            return res.status(400).send({message: "All fields are required"});
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }
        if (username.length <= 2) {
            return res.status(400).json({message: "Name must be at least 2 characters long"});
        }
        if (password !== password_conf) {
            return res.status(400).json({message: "Password and confirmation don't match"});
        }
        if (password.length <= 4) {
            return res.status(400).json({message: "Password must be at least 4 characters long"});
        }
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);
        const new_admin = await Admin.create({
            username,
            email,
            password: hashPassword
        })
        const token = jwt.sign({adminId: new_admin.id}, process.env.SECRET_KEY, {expiresIn: '1 years'});
        res.status(201).json({message: "Admin created successfully", token});
    }

    async login (req, res) {
        try {
            const {username, email, password} = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({message: "All fields are required"});
            }
            const admin = await Admin.findOne({where: {username: username, email: email}});
            if (!admin) {
                return res.status(404).json({message: "Admin not found"});
            }
            const isMatch = await bcryptjs.compare(password, admin.password);
            if (isMatch && admin.username === username && admin.email === email) {
                const token = jwt.sign({adminId: admin.id}, process.env.SECRET_KEY, {expiresIn: '1 years'});
                res.status(200).json({message: "Admin login successfull", token});
            } 
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Error in login by admin"});
        }
    }

    async getAdmin (req, res) {
        try {
            const id = req.admin.id;
            const admin = await Admin.findOne({
                where: {id: id},
                attributes: { exclude: ['password'] },
            });
            if (!admin) {
                return res.status(404).json({message: "Amdin not found"});
            }
            res.status(200).json(admin);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting profile admin"});
        }
    }

    async changePassword (req, res) {
        const {password, password_conf} = req.body;
        try {
            if (password !== password_conf) {
                return res.status(400).json({message: "Password and confirmation not match"});
            }
            const id = req.admin.id;
            const admin = await Admin.findOne({where: {id}});
            if (!admin) {
                res.status(404).json({message: "Admin not found"});
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            admin.password = hashPassword;
            await admin.save();
            res.status(200).json({message: "Password successfully edited"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to edit password"});
        }
    }

    async deleteAccount (req, res) {
        try {
            const {id} = req.admin.id;
            const admin = await Admin.findOne({where: {id}});
            if (!admin) {
                return res.status(404).json({message: "Admin not found"});
            }
            await admin.destroy();
            res.status(200).json({message: "Account successfully deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to delete admin account"});
        }
    }
}

module.exports = AdminAuthentification;