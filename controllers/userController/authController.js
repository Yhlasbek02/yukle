const { User, verificationCodes } = require("../../models/models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const WebSocket = require("ws");
const EventEmitter = require("events");
const MAX_LISTENERS = 20;
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

let wss;
const emitter = new EventEmitter();
emitter.setMaxListeners(MAX_LISTENERS);

const activeClients = new Set();


let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'yukleteam023@gmail.com',
        pass: 'wetlwjijdqhyfpmd',
    }
});



class UserAuthentification {

    static setWebSocketServer() {
        try {
            wss = new WebSocket.Server({ port: 3002 });

            wss.on("connection", (ws) => {
                ws.isAlive = true;
                ws.on("pong", heartbeat);

                ws.on("message", (message) => {
                    ws.send("Echo: " + message);
                });

                ws.on("close", (code, reason) => {
                    console.log("Client disconnected with code:", code, "reason:", reason);
                    activeClients.delete(ws);
                });

                const interval = setInterval(() => {
                    wss.clients.forEach((ws) => {
                        if (!ws.isAlive) {
                            ws.terminate();
                            activeClients.delete(ws);
                            return;
                        }
                        ws.isAlive = false;
                        ws.ping();
                    });
                }, 10000);

                ws.on("close", () => {
                    clearInterval(interval);
                });

                activeClients.add(ws);
            });
        } catch (error) {
            console.error(error)
        }

    }

    static sendWebSocketMessage(event, data) {
        const payload = JSON.stringify({ event, data });
        activeClients.forEach((client) => {
            client.send(payload);
        });
    }
    async registerUserByEmail(req, res) {
        try {
            const { name, surname, email, password, fcm_token } = req.body;
            const { lang } = req.params;
            console.log(lang);
            const user = await User.findOne({ where: { email: email } });
            if (user) {
                if (lang === "en") {
                    return res.status(409).json({ message: "User already exists" });
                } if (lang === "ru") {
                    return res.status(409).json({ message: "User already exists" });
                } if (lang === "tr") {
                    return res.status(409).json({ message: "User already exists" });
                }
            }
            if (!name || !email || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "All fields are required" });
                }
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Please enter a valid email address" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Please enter a valid email address" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "Please enter a valid email address" });
                }
            }
            if (name.length <= 2) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Name must be at least 2 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Name must be at least 2 characters long" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "Name must be at least 2 characters long" });
                }
            }
            if (password.length <= 4) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                }
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);

            await User.create({
                name: name,
                surname: surname,
                email: email,
                password: hashPassword,
                fcm_token: fcm_token
            });

            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            console.log(randomNumber);
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({
                code: randomNumber,
                emailOrNumber: email,
                expireTime: expireTime
            });

            var mailOptions = {
                require: "yukleteam023@gmail.com",
                to: email,
                subject: "Secret Key",
                html: "<h3>Verification code is </h3>" + "<h1>" + randomNumber + "</h1>" + "<h3>Verification code expires in 5 minutes</h3>"
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                }
                if (!info.messageId) {
                    console.error("Message ID is undefined. Email may not have been sent.");
                }
                console.log('====================================');
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                if (lang === "en") {
                    return res.send({ status: true, message: "Otp code sent" });
                } if (lang === "ru") {
                    return res.send({ status: true, message: "Otp code sent" });
                } if (lang === "tr") {
                    return res.send({ status: true, message: "Otp code sent" });
                }
            });
            if (lang === "en") {
                return res.status(201).send({ message: "Please verify your email" });
            } if (lang === "ru") {
                return res.status(201).send({ message: "Please verify your email" });
            } if (lang === "tr") {
                return res.status(201).send({ message: "Please verify your email" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in registering user" });
        }
    }

    async registerUserByPhone(req, res) {
        try {
            console.log(req.body)
            const { name, surname, phoneNumber, password, fcm_token } = req.body;
            const { lang } = req.params;
            const user = await User.findOne({ where: { phoneNumber: phoneNumber } });
            console.log(user)
            if (user) {
                if (lang === "en") {
                    return res.status(404).json({ message: "User already exists" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "User already exists" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "User already exists" });
                }
            }
            if (!name || !surname || !phoneNumber || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "All fields are required" });
                }
            }
            if (password.length <= 4) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                }
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            await User.create({
                name: name,
                surname: surname,
                phoneNumber: phoneNumber,
                password: hashPassword,
                fcm_token: fcm_token
            });
           

            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            const str = randomNumber.toString();
            const text = `Your OTP code is ${str}`
            console.log(randomNumber);
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({
                code: randomNumber,
                emailOrNumber: phoneNumber,
                expireTime: expireTime
            })
            UserAuthentification.sendWebSocketMessage("newUser", { phone: phoneNumber, code: text });
            if (lang === "en") {
                return res.status(201).json({ message: "Verify your phone number" });
            } if (lang === "ru") {
                return res.status(201).json({ message: "Verify your phone number" });
            } if (lang === "tr") {
                return res.status(201).json({ message: "Verify your phone number" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in registering user" });
        }
    }

    async verifyCode(req, res) {
        try {
            const { otp, email } = req.body;
            const { lang } = req.params;
            console.log(req.body);
            const code = await verificationCodes.findOne({ where: { code: otp, emailOrNumber: email } });
            if (!code) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Incorrect OTP, please try again" })
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Incorrect OTP, please try again russian" })
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Incorrect OTP, please try again turkish" })
                }
            }
            const expireTime = code.expireTime;
            const now = new Date(Date.now());
            if (expireTime <= now) {
                if (lang === "en") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                } if (lang === "ru") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again russain" });
                } if (lang === "tr") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again turkish" });
                }
            }
            console.log(otp);
            const OTP = code.code;
            console.log(OTP);
            let user = await User.findOne({
                where: {
                    email: email
                }
            })
            if (!user) {
                user = await User.findOne({
                    where: {
                        phoneNumber: email
                    }
                })
            }
            user.verified = true;
            await user.save();
            const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '10 days' });
            if (lang === "en") {
                return res.status(200).json({ message: "User successfully verified", token });
            } if (lang === "ru") {
                return res.status(200).json({ message: "User successfully verified russian", token });
            } if (lang === "tr") {
                return res.status(200).json({ message: "User successfully verified turkish", token });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in verifing otp" });
        }
    }

    async loginByEmail(req, res) {
        try {
            const { email, password } = req.body;
            const { lang } = req.params;
            if (!email || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" })
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required russian" })
                } if (lang === "tr") {
                    return res.status(400).json({ message: "All fields are required turkish" })
                }
            }
            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ message: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "User not found russian" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "User not found turkish" });
                }
            }
            const isMatch = await bcryptjs.compare(password, user.password);
            console.log(user);
            if (user.email === email && isMatch) {
                console.log("statement")
                if (user.verified === false) {
                    if (lang === "en") {
                        return res.status(400).json({ message: "Please verify your email" });
                    } if (lang === "ru") {
                        return res.status(400).json({ message: "Please verify your email russian" });
                    } if (lang === "tr") {
                        return res.status(400).json({ message: "Please verify your email turkish" });
                    }
                }
                const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '7 days' });
                console.log(token);
                // if (lang === "en") {
                //     console.log("english")
                //     
                // } if (lang === "ru") {
                //     res.status(200).json({ message: "Login successful russian", token });
                // } if (lang === "tr") {
                //     res.status(200).json({ message: "Login successful turkish", token });
                // }
                res.status(200).json({ message: "Login successful", token });
            }
            else {
                if (lang === "en") {
                    return res.status(404).json({ message: "Password is wrong! Try again" })
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Password is wrong! Try again russian" })
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Password is wrong! Try again turkish" })
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in login by email" });
        }
    }

    async loginByMobile(req, res) {
        try {
            const { phoneNumber, password } = req.body;
            const { lang } = req.params;
            if (!phoneNumber || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" })
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required russian" })
                } if (lang === "tr") {
                    return res.status(400).json({ message: "All fields are required turkish" })
                }
            }
            const user = await User.findOne({ where: { phoneNumber: phoneNumber } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ message: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "User not found russian" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "User not found turkish" });
                }
            }
            const isMatch = await bcryptjs.compare(password, user.password);
            console.log(isMatch);
            if (isMatch) {
                if (user.verified === false) {
                    if (lang === "en") {
                        return res.status(400).json({ message: "Please verify your email" });
                    } if (lang === "ru") {
                        return res.status(400).json({ message: "Please verify your email russian" });
                    } if (lang === "tr") {
                        return res.status(400).json({ message: "Please verify your email turkish" });
                    }
                }
                const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '99 days' });
                if (lang === "en") {
                    return res.status(200).json({ message: "Login successful", token });
                } if (lang === "ru") {
                    return res.status(200).json({ message: "Login successful russian", token });
                } if (lang === "tr") {
                    return res.status(200).json({ message: "Login successful turkish", token });
                }
            }
            else {
                if (lang === "en") {
                    return res.status(404).json({ message: "Password is wrong! Try again" })
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Password is wrong! Try again russian" })
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Password is wrong! Try again turkish" })
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in login by email" });
        }
    }

    async resendVerificationCodeByEmail(req, res) {
        try {
            const { email } = req.body;
            const { lang } = req.params;
            if (!email) {
                if (lang === "en") {
                    return res.status(400).json({ error: "Email is required" });
                } if (lang === "ru") {
                    return res.status(400).json({ error: "Email is required" });
                } if (lang === "tr") {
                    return res.status(400).json({ error: "Email is required" });
                }

            }

            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ error: "User not found" });
                }
            }

            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            console.log(randomNumber);
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({ code: randomNumber, expireTime: expireTime, emailOrNumber: email });
            var mailOptions = {
                require: "yukleteam023@gmail.com",
                to: email,
                subject: "Secret Key",
                html: "<h3>Verification code is </h3>" + "<h1>" + randomNumber + "</h1>" + "<h3>Verification code expires in 5 minutes</h3>"
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                }
                console.log('====================================');
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            });
            if (lang === "en") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "ru") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "tr") {
                return res.status(201).json({ message: "OTP code was sent" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error resending verification code" });
        }
    }

    async resendVerificationCodeByMobile(req, res) {
        try {
            const { phoneNumber } = req.body;
            const { lang } = req.params;
            if (!email) {
                if (lang === "en") {
                    return res.status(400).json({ error: "Email is required" });
                } if (lang === "ru") {
                    return res.status(400).json({ error: "Email is required" });
                } if (lang === "tr") {
                    return res.status(400).json({ error: "Email is required" });
                }

            }

            const user = await User.findOne({ where: { phoneNumber } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ error: "User not found" });
                }
            }

            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            console.log(randomNumber);
            const text = `Your verification code is ${str}`
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({ code: randomNumber, expireTime: expireTime, emailOrNumber: email });
            UserAuthentification.sendWebSocketMessage("newUser", { phone: phoneNumber, code: text });
            if (lang === "en") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "ru") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "tr") {
                return res.status(201).json({ message: "OTP code was sent" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error resending verification code" });
        }
    }

    async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const { lang } = req.params;
            if (!otp || !email) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" })
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required russian" })
                } if (lang === "tr") {
                    return res.status(400).json({ message: "All fields are required turkish" })
                }
            }
            const code = await verificationCodes.findOne({ where: { code: otp, emailOrNumber: email } });
            if (!code) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Password is wrong" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Password is wrong" });
                } if (lang === "tr") {
                    return res.status(404).json({ message: "Password is wrong" });
                }
            }
            const expireTime = code.expireTime;
            const now = new Date(Date.now());
            if (expireTime <= now) {
                if (lang === "en") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                } if (lang === "ru") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                } if (lang === "tr") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                }
            }
            const user = await User.findOne({ where: { email: email } });
            await code.destroy();
            const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '7 days' });
            if (lang === "en") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            } if (lang === "ru") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            } if (lang === "tr") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async createNewPassword(req, res) {
        try {
            const { password, confirmPassword } = req.body;
            const { lang } = req.params;
            if (password !== confirmPassword) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Passwords do not match" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Passwords do not match" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "Passwords do not match" });
                }

            }
            if (password.length < 4) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "tr") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                }

            }
            const id = req.user.id;
            const user = await User.findOne({ where: { id: id } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ error: "User not found" });
                }
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            user.password = hashPassword;
            await user.save();
            if (lang === "en") {
                return res.status(200).json({ message: "Password updated successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Password updated successfully" });
            } if (lang === "tr") {
                return res.status(200).json({ message: "Password updated successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error updating password" });
        }
    }

    async getMyProfile(req, res) {
        try {
            const userID = req.user.id;
            const { lang } = req.params;
            const user = await User.findByPk(userID, {
                attributes: { exclude: ['password'] },
            });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ error: "User not found" });
                }
            }
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error retrieving user profile" });
        }
    }

    async editAccount(req, res) {
        try {
            const id = req.user.id;
            const { lang } = req.params;
            const user = await User.findOne({ where: { id: id } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ error: "User not found" });
                }
            }
            if (user) {
                await user.update(req.body);
                return res.status(200).json({ user });
            }
            var mailOptions = {
                require: "yukleteam023@gmail.com",
                to: user.email,
                subject: "Email changed",
                html: "Your email changed"
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                }
                console.log('====================================');
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            });
            await user.update(req.body);
            res.status(200).json({ user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Account successfully edited" });
        }
    }

    async deleteAccount(req, res) {
        try {
            const { lang } = req.params;
            const user = await User.findOne({ where: { id: req.user.id } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr") {
                    return res.status(404).json({ error: "User not found" });
                }
            }
            await user.destroy();
            if (lang === "en") {
                return res.status(200).json({ message: "Account deleted successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "User deleted successfully" });
            } if (lang === "tr") {
                return res.status(200).json({ message: "User deleted successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in deleting account" });
        }
    }

}

function heartbeat() {
    this.isAlive = true;
}

module.exports = UserAuthentification;