if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError = require('./util/expressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const db_url = process.env.DB_URL ||'mongodb://127.0.0.1:27017/yelp-camp'


app.use(mongoSanitize())

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

async function main() {
    await mongoose.connect(db_url);
    console.log('Conected data base')
}
main().catch(err => console.log(err));

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))

app.engine('ejs', engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';


const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on('error', function(e){
    console.log(e)
})

const sessionConfig = {
    store:store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.signedUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbu0iwr3h/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            // fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//CAMPGROUNDS ROUTS
app.use('/campgrounds', campgroundRoutes)

//REVIEWS ROUTS
app.use('/campgrounds/:id/reviews', reviewRoutes);

//USERS ROUTES
app.use('/', userRoutes);

//HOME
app.get('/', (req, res) => {
    res.render('home');
})

//HANDLIG ERRORS
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

//OPENNING SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})