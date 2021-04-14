require("dotenv").config();
const express = require("express");
const app = express();
const path = require('path');



const connectDB = require('./config/db');
connectDB();



app.use(express.json());


app.use(express.static('public'));



app.set('views',path.join(__dirname,'/views'));
app.set('view engine' , 'ejs');



app.use('/api/files',require('./routes/files'));
app.use('/files',require('./routes/show'));
app.use('/files/download',require('./routes/download'));

const PORT = process.env.PORT || 4580;


app.listen(PORT , ()=>{
    console.log(`listenting on port: ${PORT}`);
})