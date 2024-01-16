const express = require("express");
const dotenv = require("dotenv");
const sequelize = require('./config/config');
const http = require("http");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const {Op} = require("sequelize");
const routes = require("./routes/allRoutes");
const country = require("./controllers/countryController");
const {verificationCodes, User} = require("./models/models");
dotenv.config();
const app = express();
const server = http.createServer(app);
const expressWs = require("express-ws")(app, server);
const UserAuthentification = require("./controllers/userController/authController");
const dirname = path.resolve();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
const PORT = 3001 || 8000;
app.use(cookieParser());
app.use(express.json());
UserAuthentification.setWebSocketServer(expressWs.getWss());
app.use("/", express.static(path.join(__dirname, "build")));
app.use("/api", routes);
app.use("/", country);
app.all("*", (req, res, next) => {
  return res.status(404).json({message: `Can't find ${req.originalUrl} on this server`});
});
// async function deleteExpriredUsers() {
//   const current_time = Date.now();
//   try {
//     const codes = await verificationCodes.findAll({where: {expireTime: {[Op.lte]: current_time}}})
//     const userEmails = codes.map(code => code.emailOrNumber);
//     const users = await User.findAll({
//       where: {
//         email: {
//           [Op.in]: userEmails
//         }
//       }
//     });
//     for (const code of codes) {
//       await code.destroy();
//     }
//     for (const user of users) {
//       await user.destroy();
//     }
//     console.log(`${users.length} user and ${codes.length} code are removed from database`);
//   } catch (error) {
//     console.log(error);
//   }
// }

// setInterval(deleteExpriredUsers, 3 * 60 * 1000);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({alter:true});
    server.listen(PORT, () => console.log(`server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
}

start();
