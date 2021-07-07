require('dotenv').config()
const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const flash = require('express-flash');
var MongoClient = require('mongodb').MongoClient;
var url = `${process.env.DB_URL}`;
const jwt = require('jsonwebtoken')


router.use(express.json());

router.use(flash());

router.post('/login', (req, res)=>{
	//connect to db
	MongoClient.connect(url, {useUnifiedTopology: false}, async function(err, db) {
  		if (err) throw err;
  		//prep information to be pushed to database
  		var dbo = db.db("userdb");
  		var query = {userEmail: req.body.email}

  		
  		const options = {"upsert": false}
  		dbo.collection('registeredUsers').find(query).toArray( async (err, result)=> {
  			if (err) throw err;
  			await bcrypt.compare(req.body.password, result[0].userPassword, async (err, hash)=>{
  				if (err) throw err;
          if (!hash) {
            return res.render('login.ejs')
          }
          else {
            req.session.user = req.body.name;
            const accessToken = await jwt.sign({name: result[0].userName}, process.env.ACCESS_TOKEN_SECRET);
            res.cookie('cookieEmail', query.userEmail)
            res.cookie('cookie', accessToken);
            res.redirect('/home');
          }
  			})
  		})
	});	
	
})

module.exports= router;