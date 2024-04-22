if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const passportLocal = require('passport-local');
const Profile = require('./models/profile');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo')(session);
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/cache-me';
// const dbUrl = 'mongodb://localhost:27017/cache-me';


const geocacheRoutes = require('./routes/geocaches');
const ratingRoutes = require('./routes/ratings');
const profileRoutes = require('./routes/profiles');


mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(morgan('dev'));

const store = new MongoStore({
    url: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'marioandluigi'
    }
});

store.on('error', function(e){
    console.log('An error has occured with the session store', e)
})

const configSession = {
    store,
    name: 'session',
    secret: 'marioandluigi',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(configSession));
app.use(flash());
app.use(helmet());

//Sources for scripts that we want to allow
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhqyvrb9y/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(Profile.authenticate()));

passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.signedInUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.deleted = req.flash('deleted');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const profile = new Profile({ email: 'ryan@gmail.com', username: 'RyanSG' });
    const newProfile = await Profile.register(profile, 'mario');
    res.send(newProfile);
})

app.use('/geocaches', geocacheRoutes); // This line is needed to connect to the geocaches.js file in the routes directory
app.use('/geocaches/:id/ratings', ratingRoutes); // This line is needed to connect to the ratings.js file in the routes directory
app.use('/', profileRoutes);  // This line is needed to connect to the profiles.js file in the routes directory

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found :(', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Ohhhh Boy...Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
});