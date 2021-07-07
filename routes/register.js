const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require ('express-session');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

var MongoClient = require('mongodb').MongoClient;
var url = `${process.env.DB_URL}`;
const Users = require('../models/users.js');
const watchlist = require('../models/watchlist.js')
router.use(express.json());
router.use(cookieParser());

router.post('/register'/*, 
	body('email').isEmail(), body('password').isStrongPassword({minLength: 6, minSymbols: 0})*/, (req, res)=>{
		console.log('hello from post method register route')
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			const alert = errors.array()
			return res.render('register.ejs', {alert})
		}  

		//connect to db
		MongoClient.connect(url, async function(err, db) {
			if (err) throw err
	
	  		//prep information to be pushed to database 
	  		const {name, email, password} = req.body
            const accessToken = await jwt.sign({name}, process.env.ACCESS_TOKEN_SECRET)
			const passwordHash = await bcrypt.hash(password, saltRounds);
	  		var dbo = db.db("userdb");
	  		const user = new Users ({ 
	  						userName: name,
	  						userEmail: email, 
	  						userPassword: passwordHash
	  					});
			userWatchlist = new watchlist({
			userEmail: email,
			ticker: [

			]
			})

	  		//prep query to search for emails that are registered already.
	  		dbo.collection("registeredUsers").findOne({userEmail: email}, (err, result) => {
	  			if (err) throw err;
			  	//insert registered user information on successful registration.

			  	if (result == null){
			  		dbo.collection("watchlist").insertOne(userWatchlist, function(err, result){
						if (err) throw err;
			  		})
			  		dbo.collection("registeredUsers").insertOne(user, function(err, result) {
			    		if (err) throw err;
			    		req.session.user = user.userName;
			    		res.cookie('cookieEmail', user.userEmail)
			    		res.cookie('cookie', accessToken);
			    		res.redirect('/home');
			  		});
			  	}else{
					return res.status(403).send("That username is already registered.");
		  		}
			})
		});	
	}
)

module.exports = router;