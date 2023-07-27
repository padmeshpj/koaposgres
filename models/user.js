const { Sequelize, DataTypes } = require('sequelize');
const Address = require("./address");

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'mydatabase',
    username: 'postgres',
    password: 'postgres'
});

// Defining post model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
    {
        paranoid: true, // enable soft delete
    }
);
User.hasOne(Address); // Define the one-to-one association

module.exports = User;