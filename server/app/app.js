const express = require('express');
const Router = require('express');
const dotenv = require('dotenv');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
var morgan = require('morgan');
const fs = require('fs');
const cors = require('cors');
const config = require('../config/config');

const cognitoRoute = require('./../controllers/aws/cognitoAuth');


const swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger/swagger.json');



dotenv.load({path: '.env.pbh'});

const userRoute = require('../routes/user');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.set('host', config.host);
app.set('port', config.sqlPort );
// view engine setup

// app.use(morgan('combined', { stream: winston.stream }));

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(passport.initialize());
app.use(passport.session());


const router = new Router()

app.use('/calendar', userRoute);
app.use('/auth', cognitoRoute);


if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorHandler());
} else {
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
}

module.exports = app;
