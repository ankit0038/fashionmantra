const app = require('./app');
const connectDb = require('./config/db');
require('dotenv').config({path: __dirname+'/.env'});

const cloudinary = require('cloudinary');


const port = process.env.PORT;

//console.log(process.env.PORT);

//connecting to DB
connectDb();

//cloudinary configuration
cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
});
 
app.listen(port, () => console.log("Server is running at port : " + port));