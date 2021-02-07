
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 8080;

const db = require('./models');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}))

app.use(express.static(__dirname + "/public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var hbs = exphbs.create({});
hbs.handlebars.registerHelper('isWhite', function(color) {
    return color === "rgb(255, 255, 255)";
});

// Controllers
const userController = require('./controllers/userController');
app.use(userController);

const collectionController = require('./controllers/collectionController');
app.use('/api/collections', collectionController);

const bookmarkController = require('./controllers/bookmarkController');
app.use('/api/bookmarks', bookmarkController);

const tagController = require('./controllers/tagController');
app.use('/api/tags', tagController);

app.use(require('./controllers/listRenderer'));
app.use(require('./controllers/modalRenderer'));
app.use(require('./controllers/renderingRoutes'));

db.sequelize.sync({ force: process.env.FORCE_SYNC }).then(function () {
    app.listen(PORT, function () {
        console.log("App listening on PORT " + PORT);
    });
});
