const { Sequelize, DataTypes } = require("sequelize");


const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'mydatabase',
    username: 'postgres',
    password: 'postgres'
});

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // The name of the referenced table
            key: 'id',      // The primary key of the referenced table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    zipCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

module.exports = Address;