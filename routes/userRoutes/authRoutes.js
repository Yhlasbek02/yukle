const express = require("express");
const router = express.Router();
const UserAuthentification = require("../../controllers/userController/authController");
const checkUserAuth = require("../../middlewares/auth");
const UserAuth = new UserAuthentification()

router.get("/", async (req, res) => {
    res.send({message: "test"})
})
router.post("/sign-up/email/:lang", UserAuth.registerUserByEmail);
router.post("/sign-up/mobile/:lang", UserAuth.registerUserByPhone);
router.post("/verify/:lang", UserAuth.verifyCode);
router.post("/login/email/:lang", UserAuth.loginByEmail);
router.post("/login/mobile/:lang", UserAuth.loginByMobile);
router.post("/resend-code/email/:lang", UserAuth.resendVerificationCodeByEmail);
router.post("/verify-otp/:lang", UserAuth.verifyOtp);
router.post("/change-pass/:lang", checkUserAuth, UserAuth.createNewPassword);
router.get("/profile/:lang", checkUserAuth, UserAuth.getMyProfile);

module.exports = router;