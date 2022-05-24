const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const route = require('./route/route.js');
const multer= require("multer");
const bcrypt = require('bcrypt')
const app = express();
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( multer().any())

mongoose.connect("mongodb+srv://Vinit12:Vinit123@cluster0.hjamr.mongodb.net/Group34DataBase").then(() => console.log("MongoDB Is Connected")).catch(err => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express App Is Running On Port ' + (process.env.PORT || 3000))
});
