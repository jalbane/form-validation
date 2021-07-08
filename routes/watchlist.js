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

router.post('/watchlist', (req, res)=>{
	let tickername = req.body.tickerName;

	let email = req.headers.cookie.split('cookieEmail=')[1].split(';')[0]
	let [emailName, host] = email.split('%40')
	email = [emailName, host].join('@')

	// Unsubscribe
	var unsubscribe = function(symbol) {
		socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}));
	}

	const socket = new WebSocket('wss://ws.finnhub.io?token=c3ij7qaad3ib8lb87b3g');
	// Connection opened -> Subscribe
	socket.addEventListener('open', function (event) {
		socket.send( JSON.stringify({'type':'subscribe', 'symbol': req.body.tickerName}))
	});		

	// Listen for messages
	socket.addEventListener('message', async function (event) {
		res.locals.arr = await JSON.parse(event.data);
		//if error occurs with request return home
		if (res.locals.arr.type === "ping"){
			unsubscribe(req.body.tickerName)
			socket.close()
			return res.redirect('/home')
		}
		else{
			unsubscribe(req.body.tickerName);
			socket.close();		
			MongoClient.connect(url, {useUnifiedTopology: true}, async function(err, db){
			if (err) throw err;
			let dbo = db.db('userdb') 		
			await dbo.collection("watchlist").updateOne(
				{
					userEmail: email
				},
				{
					$push:  {ticker: {name: res.locals.arr.data[0].s, price: res.locals.arr.data[0].p} }
				}
			)	
			res.redirect('/home')
			})	
		}
	})
})

module.exports = router;
