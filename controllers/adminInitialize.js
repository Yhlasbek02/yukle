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

const sendNotification = async (deviceToken, title, body, uuid, type, locationCountry) => {
    try {
        await admin.messaging().send({
            token: deviceToken,
            apns: {
                payload: {
                    aps: {
                        alert: {
                            title: title,
                            body: body,
                        },
                    },
                },
            },
            notification: {
                title: title,
                body: body
            },
            data: {
                uuid: uuid,
                type: type,
                title: title,
                body: locationCountry
            }
            
        });
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

const sendMessage = async (deviceToken, chatId, message, user, time) => {
    try {
        await admin.messaging().send({
            token: deviceToken,
            notification: {
                title: user,
                body: message
            },
            data: {
                chatId: chatId,
                time: time,
                title: user,
                body: message
            }
        })
    } catch (error) {
        console.error("server error", error);
    }
}

module.exports = {sendNotification, sendMessage};
