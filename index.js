const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { Sequelize, DataTypes } = require('sequelize');
const Address = require("./models/address")

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
User.hasOne(Address); // Define the one-to-one association

//middleware of KOA
app.use(bodyParser());

// * Koa router
// Getting all the users ---------------- GET
router.get('/users', async (ctx) => {
  try {
    const posts = await User.findAll({
      paranoid: false,
      attributes: { exclude: ['updatedAt', 'deletedAt', 'createdAt'] },
      include: {
        model: Address,
        attributes: ['street', 'city', 'state', 'zipCode'], //Only the desired attributes from Address model
      },
    });
    ctx.body = posts;
  } catch (error) {
    console.log('errrrrrr', error);
  }
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
  const { name, gender, age, address } = ctx.request.body; // Assuming address contains street, city, state, zipCode

  try {
    let createdUser;

    // Create the user along with the associated address (if available)
    if (address) {
      createdUser = await User.create({
        name,
        gender,
        age,
        Address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        },
      }, {
        include: Address, // Include the associated Address model while creating the User
      });
    } else {
      // If no address is provided, create the user without the address
      createdUser = await User.create({ name, gender, age });
    }

    // ctx.body = createdUser;
    ctx.body = {
      name: createdUser.name,
      gender: createdUser.gender,
      age: createdUser.age,
      address: createdUser.Address ? {
        street: createdUser.Address.street,
        city: createdUser.Address.city,
        state: createdUser.Address.state,
        zipCode: createdUser.Address.zipCode,
      } : null, //if Address ips true then addr prop. will show else show null
    };

  } catch (err) {
    console.log('Error:', err);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while creating the user.' };
  }
});



//Updating the user ---------------------- PUT
router.put('/users/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, gender, age, address } = ctx.request.body;
  try {
    let user = await User.findByPk(id, {
      include: Address // Include the associated Address model while querying the User
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' }
      return;
    }
    // If the 'address' field is provided in the request body, update the associated address
    if (address) {
      if (user.Address) {
        // If the user already has an associated address, update it
        await user.Address.update({
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        });
      } else {
        // If the user doesn't have an associated address, create a new one
        await Address.create({
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          UserId: user.id, // Assuming you have a foreign key named 'UserId' in the Address model
        });
      }
    }
    // Update the user info
    await user.update({ name, gender, age });
    // Fetch the updated user and associated address to send back in the response
    user = await User.findByPk(id, {
      include: Address // Include the associated Address model
    });
    ctx.body = {
      name: user.name,
      gender: user.gender,
      age: user.age,
      address: user.Address ? {
        street: user.Address.street,
        city: user.Address.city,
        state: user.Address.state,
        zipCode: user.Address.zipCode,
      } : null,
    };
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
});


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
