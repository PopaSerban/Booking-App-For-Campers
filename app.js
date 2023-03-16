const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const Campground = require('./models/campground');


mongoose.connect('mongodb://localhost:27017/campBooking', { 
    useNewUrlParser: true,
 });

 const db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', () => console.log('Connected to MongoDB'));

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    console.log('hello from camping app!');
    res.render('home');
});
app.get('/campgrounds', async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds: campgrounds});
})  

app.listen(3000, () => console.log('Listening on port 3000'));