const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
 
require('dotenv').config();
 
const app = express();


//for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/'
}));

//morgan middleware to monitor incoming http request
app.use(morgan('tiny'));


//import all routes here
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');
const order = require('./routes/order');

//router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', payment);
app.use('/api/v1', order);
//setting path for views folder which will be referred by ejs engine to refer ejs file
app.set('views', path.join(__dirname, 'views'));
// Set EJS as templating engine
app.set('view engine', 'ejs');

app.get('/signupform', (req, res) => {
        res.render('postform');
});

module.exports = app; 