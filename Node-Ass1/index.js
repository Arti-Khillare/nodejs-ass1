const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const createHttpError = require('http-errors');

/**
 * creating seperate variable for express function
 */
const app = express();

/**
 * requiring dotenv file for configuration
 */
require('dotenv').config();

/**
 * storing port value from env
 */
const PORT = process.env.PORT || 3000;

/**
 * cross origin resource sharing package, it is used to specify which origin can access api
 */
const cors = require('cors');
app.use(cors({
    origin:'*'
}));

/**
 * parsing the data res.body in json format using bodyParser
 */
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true}));


app.use('/api/auth', require('./src/routes/authRoute'));
app.use('/api/users', require('./src/routes/userRoute'));
app.use('/api/products', require('./src/routes/productsRoute'));

app.use((req, res, next) => {
    next(createHttpError.NotFound())
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
     error: {
     status: error.status || 500,
     message: error.message || "Internal Server Error",
    },
 });
});

/**
 * connecting mongoose
 */
mongoose.connect(process.env.DB_CONNECT , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log("connection successfull"));

/**
 * server app is listening on port
 */
app.listen(PORT, () => {
    console.log(`Server is listening on port : ${PORT}`);
})
