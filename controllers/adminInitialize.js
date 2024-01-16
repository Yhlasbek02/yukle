const admin = require("firebase-admin");
const serviceAccount = require("./accountKey.json");

try {
    const firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully:", firebaseAdmin);
} catch (error) {
    console.error("Error initializing Firebase Admin:", error);
}

const sendNotification = async (deviceToken, title, body) => {
    try {
        await admin.messaging().send({
            token: deviceToken,
            notification: {
                title: title,
                body: body
            }
        });
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

module.exports = sendNotification;
