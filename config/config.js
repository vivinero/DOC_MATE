
const mongoose = require("mongoose")

require("dotenv").config()
const db = process.env.apiLink

mongoose.connect(db).then(()=> {
    console.log("Database Connected successfully")
}).catch((error)=> {
    console.log(`Unable to connect to datbase ${error}`);
})


module.exports = mongoose.connection;