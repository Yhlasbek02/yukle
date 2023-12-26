const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const { v4: uuidv4 } = require("uuid");
const { Sequelize } = require("sequelize");

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

const User = sequelize.define("User", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fcm_token: {
        type: DataTypes.STRING
    },
    transportNotification: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    cargoNotification: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true
}
);

const Cargo = sequelize.define("Cargo", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    typeTransport: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    whatsApp: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    additional_info: {
        type: DataTypes.TEXT,
    }
},
    {
        timestamps: true
    }
);

const Transport = sequelize.define("Transport", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    email: {
        type: DataTypes.STRING,
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    desiredDirection: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    whatsApp: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    additional_info: {
        type: DataTypes.TEXT,
    }
}, { timestamps: true });

const TransportType = sequelize.define("TransportType", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    nameEn: {
        type: DataTypes.STRING,
    },
    nameRu: {
        type: DataTypes.STRING,
    },
    nameTr: {
        type: DataTypes.STRING
    }
})

const CargoType = sequelize.define("CargoType", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: () => uuidv4()
    },
    nameEn: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nameRu: {
        type: DataTypes.STRING
    },
    nameTr: {
        type: DataTypes.STRING
    }
})

const verificationCodes = sequelize.define("Codes", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expireTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    emailOrNumber: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const country = sequelize.define("Country", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    nameEn: {
        type: DataTypes.STRING
    },
    nameRu: {
        type: DataTypes.STRING
    },
    nameTr: {
        type: DataTypes.STRING
    },
});

const city = sequelize.define("City", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    nameEn: {
        type: DataTypes.STRING
    },
    nameRu: {
        type: DataTypes.STRING
    },
    nameTr: {
        type: DataTypes.STRING
    }
})

const Chat = sequelize.define("Chat", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    users: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    messages: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    }
}, { timestamps: true })

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    text: {
        type: DataTypes.STRING,
    }
}, { timestamps: true })


const adminMessage = sequelize.define("AdminMessage", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    text: {
        type: DataTypes.STRING
    }
}, { timestamps: true })


Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'user_message' });

adminMessage.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
User.hasMany(adminMessage, { foreignKey: 'receiverId', as: 'admin_message' });


//User connections with other models
Cargo.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Transport.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Cargo, { foreignKey: 'userId', as: 'cargos' });
User.hasMany(Transport, { foreignKey: 'userId', as: 'transports' });

//Cargotype connections
Cargo.belongsTo(CargoType, { foreignKey: 'typeId', as: 'type' });
CargoType.hasMany(Cargo, { foreignKey: 'typeId', as: 'cargos' });
Cargo.belongsTo(country, { foreignKey: 'fromCountry', as: 'from_country' });
country.hasMany(Cargo, { foreignKey: 'fromCountry', as: 'cargo_country' });

Cargo.belongsTo(city, { foreignKey: 'fromCity', as: 'from_city' });
city.hasMany(Cargo, { foreignKey: 'fromCountry', as: 'cargo_city' });


Cargo.belongsTo(country, { foreignKey: 'toCountry', as: 'to_country' });
country.hasMany(Cargo, { foreignKey: 'toCountry', as: 'toCountry' });

Cargo.belongsTo(city, { foreignKey: 'toCity', as: 'to_city' });
city.hasMany(Cargo, { foreignKey: 'toCity', as: 'toCity' });

//TrnasportType connections
Transport.belongsTo(TransportType, { foreignKey: 'typeId', as: 'type' });
TransportType.hasMany(Transport, { foreignKey: 'typeId', as: 'transports' });


//country and others
Transport.belongsTo(country, { foreignKey: 'belongsTo', as: 'affiliation_country' });
country.hasMany(Transport, { foreignKey: 'belongsTo', as: 'affiliation_country' });

Transport.belongsTo(country, { foreignKey: 'locationCountry', as: 'location_country' });
country.hasMany(Transport, { foreignKey: 'locationCountry', as: 'location_country' });

Transport.belongsTo(city, { foreignKey: 'locationCity', as: 'location_city' });
country.hasMany(Transport, { foreignKey: 'locationCity', as: 'location_city' });





//country and city
city.belongsTo(country, { foreignKey: 'countryId', as: 'country' });
country.hasMany(city, { foreignKey: 'countryId', as: 'country' });


module.exports = { Admin, User, Cargo, Transport, TransportType, CargoType, verificationCodes, country, city, Message, Chat, adminMessage };
