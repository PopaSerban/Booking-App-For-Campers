
const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedsHelper');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/campBooking', { 
    useNewUrlParser: true,
 });

 const db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', () => console.log('Connected to MongoDB'));

 const sample = array => array[Math.floor(Math.random() * array.length)];

 const seedDatabase = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random()*1000);
        const camp =  new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
        })
        console.log(`seeded ${i} campgrounds`);
        await camp.save();
    }
 }

 seedDatabase().then(() => {
    mongoose.connection.close().then(() => {
        console.log('connection closed');
    });
 });