const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { Sequelize, DataTypes } = require('sequelize');

const app = new Koa();
const router = new Router();

//Sequelize setting up
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

//middleware of KOA
app.use(bodyParser());


// * Koa router
// Getting all the users ---------------- GET
router.get('/users', async (ctx) => {
    const posts = await User.findAll({ paranoid: false, attributes: { exclude: ['updatedAt', 'deletedAt', 'createdAt'] } });
    ctx.body = posts;
});



//Getting 1 user ------------------------ GET
router.get('/users/:id', async (ctx) => {
    const { id } = ctx.params;
    const user = await User.findByPk(id, { attributes: { exclude: ['updatedAt', 'deletedAt', 'createdAt'] } });
    if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' }
        return;
    }
    ctx.body = user;
})


//Creating the user --------------------- POST
router.post('/users', async (ctx) => {
    const { name, gender, age } = ctx.request.body;
    const user = await User.create({ name, gender, age });
    ctx.body = { name, gender, age }
})


//Updating the user ---------------------- PUT
router.put('/users/:id', async (ctx) => {
    const { id } = ctx.params;
    const { name, gender, age } = ctx.request.body;
    const user = await User.findByPk(id);
    if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' }
        return;
    }
    await user.update({ name, gender, age });
    ctx.body = { name, gender, age };
})

//Deleting the user ---------------------- DELETE
router.delete('/users/:id', async (ctx) => {
    const { id } = ctx.params;
    const user = await User.findByPk(id);
    if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' }
        return;
    }
    await user.destroy();
    ctx.body = { message: "User deleted successfully" }
})


//Hard delete the user -------------------- DELETE
router.delete('/users/hard/:id', async (ctx) => {
    const { id } = ctx.params;
    const user = await User.findByPk(id);
    if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' }
        return;
    }
    await user.destroy({ force: true });
    ctx.body = { message: "User hard deleted successfully" }
})


app.use(router.routes());
app.use(router.allowedMethods());


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


