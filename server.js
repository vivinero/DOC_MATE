const express = require('express');

require('dotenv').config();

const app = express();
const db = require("./config/config.js");

port = process.env.port

app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});