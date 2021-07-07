const express = require('express');
const app = express();
const path = require('path');
//require('dotenv').config()
const bodyParser = require('body-parser');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const flash = require('express-flash');
const jwt = require('jsonwebtoken')
var MongoClient = require('mongodb').MongoClient;
const indexRouter = require('./routes/index');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const watchlistRouter = require('./routes/watchlist');

//middleware
app.use(express.json());
app.use(express.static(__dirname,+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(flash())
app.use(session({secret: "tacocat",
				 resave: false,
				 saveUninitialized: true
				}));
app.set('views', path.join(__dirname, 'views'))
app.set('view-engine', 'ejs')
app.use('/', indexRouter);
app.use('/', registerRouter);
app.use('/', loginRouter);
app.use('/', watchlistRouter);

// Mongo connect URL
const url = `${process.env.DB_URL}`;
// Connect to MongoDB
MongoClient.connect(url, {useUnifiedTopology: true}, (err, res)=> {
	if (err) throw err;
});

app.get('/register', (req, res) => {
	jwt.verify(req.cookies.cookie, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
		if (!err){
			res.redirect('/home');
		}else{
			res.render('register.ejs');
		}
	});
})
app.get('/login', (req, res) => {
	jwt.verify(req.cookies.cookie, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
		if (!err){
			res.redirect('/home');
		}else{
			res.render('login.ejs');
		}
	});	
})
const PORT = process.env.PORT || 80;
app.listen(PORT)
