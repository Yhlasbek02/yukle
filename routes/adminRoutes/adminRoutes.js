const express = require("express");
const router = express.Router();
const AuthRoutes = require("./authRoutes");
const cargoRoutes = require("./cargoRoutes");
const cargoTypeRoutes = require("./cargoTypeRoutes");
const transportRoutes = require("./transportRoutes");
const transportTypeRoutes = require("./transportTypeRoutes");
const userRoutes = require("./userRoutes");
const chatRoutes = require("./chatRoutes");

const checkAdminAuth = require("../../middlewares/adminAuth");
router.use("/", AuthRoutes);
router.use("/cargo", checkAdminAuth, cargoRoutes);
router.use("/cargo-type", checkAdminAuth, cargoTypeRoutes);
router.use("/transport", checkAdminAuth, transportRoutes);
router.use("/transport-type", checkAdminAuth, transportTypeRoutes);
router.use("/users", checkAdminAuth, userRoutes);
router.use("/chat", checkAdminAuth, chatRoutes);
module.exports = router;