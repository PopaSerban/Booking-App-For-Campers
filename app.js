const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const {campgroundSchema, reviewSchema} = require('./schemas');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/CatchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOveride = require('method-override');
// const { validate } = require('./models/campground');


mongoose.connect('mongodb://localhost:27017/campBooking', { 
    useNewUrlParser: true,
 });

 const db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', () => console.log('Connected to MongoDB'));

const app = express();
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true}));
app.use(methodOveride('_method'));

const validateCampground = (req, res, next) => {
    const {error } = campgroundSchema.validate(req.body);
    if(error){
        const message = error.details.map(msg => msg.message).join(',');
        throw new ExpressError(message, 400);
    }else next();
};
const validateReview= (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const message = error.details.map(msg=> msg.message).join(',');
        throw new ExpressError(message, 400);
    }else next();
};

app.get('/', (req, res) => {
    console.log('hello from camping app!');
    res.render('home');
});
app.get('/campgrounds', catchAsync(async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds: campgrounds});
}));

app.get('/campgrounds/new', catchAsync(async (req, res) =>{
    res.render('campgrounds/new');
}));
app.post('/campgrounds', validateCampground,catchAsync(async (req,res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground: campground});
}));
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground: campground});
}));
app.put('/campgrounds/:id', validateCampground,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${id}`);
}));
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async (req, res)=>{
   const campground = await Campground.findById({_id: req.params.id})
   const review = new Review(req.body.review);
   campground.reviews.push(review);
   await review.save();
   await campground.save();
   res.redirect(`/campgrounds/${campground._id}`);
}));

app.all('*',(req, res, next) => {
    next(new ExpressError('Page not found',404))
    res.send('404')
});

app.use((err, req, res ,next) => {
    const {statusCode=500, message='Something went wrong'} = err
    if(!err.message) err.message = 'Oh No! Something went wrong'
    res.status(statusCode).render('errors',{err});
})

app.listen(3000, () => console.log('Listening on port 3000'));