const express = require('express')
const router = express.Router();
//require('dotenv').config()
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient
const url = `${process.env.DB_URL}`;
const WebSocket = require('ws');


router.get('/watchlist', (req, res) => {
	//console.log("line 18 \n\n", req.session)	
	let token = req.headers.cookie.split('cookie=')[1].split(';')[0]; 

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
		res.render('watchlist.ejs',{name: decoded.name});
	})
})

function pushWatchlist(req, res, next){

	console.log('Made it to push watchlist method')

	const socket = new WebSocket('wss://ws.finnhub.io?token=c3ij7qaad3ib8lb87b3g');
	// Connection opened -> Subscribe
	socket.addEventListener('open', function (event) {
		socket.send(JSON.stringify({'type':'subscribe', 'symbol': req.body.tickerName}));
	});		

	// Listen for messages
	socket.addEventListener('message', async function (event) {
		res.locals.arr = await JSON.parse(event.data);
		//if error occurs with request return home
		console.log(res.locals)
		if (res.locals.arr.data[0].p == undefined || res.locals.arr.data[0].s == undefined){
			unsubscribe(req.body.tickerName)
			socket.close()
			res.redirect('/home')
		}
		else{
			unsubscribe(req.body.tickerName);
			socket.close();
			next();
		}
	})	
	
	// Unsubscribe
	var unsubscribe = function(symbol) {
		socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}));
	}
}

router.post('/watchlist', pushWatchlist, (req, res)=>{
	let tickername = req.body.tickerName;

	console.log('Made it to post method')

	let email = req.headers.cookie.split('cookieEmail=')[1].split(';')[0]
	let [emailName, host] = email.split('%40')
	email = [emailName, host].join('@')

		MongoClient.connect(url, function(err, db){
			if (err) throw err;
			let dbo = db.db('userdb') 		
			dbo.collection("watchlist").updateOne(
				{
					userEmail: email
				},
				{
					$push:  {ticker: {name: res.locals.arr.data[0].s, price: res.locals.arr.data[0].p} }
				}
			)	
			res.redirect('/home')
		})
})

module.exports = router;