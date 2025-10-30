const express = require('express');
const app = express();  
const mongoose = require('mongoose');
const morgan = require('morgan');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/errorHandler');
require('dotenv/config');

//? Some definitions
const api = process.env.API_URL;
const connectionString = process.env.CONNECTION_STRING;

//! Middlewares
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

//? Authentication with Jwt
app.use(authJwt());
app.use(errorHandler);


//! Database Connection
mongoose.connect(connectionString)
    .then(() => {
        console.log('MongoDB\'ye bağlanıldı.+')
        app.listen(3000)
        console.log(api)
    })
    .catch(err => {
        console.log(`ERROR:${err}`);
    })

//! Importing the Routers
const categoryRoutes = require('./routers/categories');
const orderRoutes = require('./routers/orders');
const productRoutes = require('./routers/products');
const userRoutes = require('./routers/users');

//! Routes
app.use((req, res, next) => {
    if(req.method == 'GET') console.log('GET request was made');
    else if(req.method == 'POST') console.log('POST request was made')
    else console.log('request was made')
    next();
})
//! Products Route
app.use(`${api}/products`, productRoutes)
app.use(`${api}/categories`, categoryRoutes)
app.use(`${api}/users`, userRoutes)
//todo app.use(`${api}/orders`, orderRoutes)
