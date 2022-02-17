const mongoose = require('mongoose');

const connectDb = () => {
        mongoose.connect(process.env.DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
        })
        .then(console.log('DB connection successful'))
        .catch(error => {
                console.log('DB connection Error');
                console.log(error);
                process.exit(1);
        });
}

module.exports = connectDb;