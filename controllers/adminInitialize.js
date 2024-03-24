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

const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24
};

const sendNotification = async (deviceToken, title, body, uuid, type) => {
    try {
        await admin.messaging().send({
            token: deviceToken,
            apns: {
                payload: {
                    aps: {
                    }
                }
            },
            notification: {
                title: title,
                body: body
            },
            android: {
                notification: {
                    clickAction: `/language/home/detail ${uuid} ${type}`
                }
            }
        });
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

module.exports = sendNotification;
