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
	let name = req.headers.cookie.split('name=')[1].split(';')[0];
	name = name.split('%20')[0]
	
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
		res.render('watchlist.ejs',{name: name, error: err});
	})
})

function searchWatchlist(req, res, next){
	res.locals.tickername = req.body.tickerName.toUpperCase();

	let email = req.headers.cookie.split('cookieEmail=')[1].split(';')[0]
	let [emailName, host] = email.split('%40')
	res.locals.email = [emailName, host].join('@')

	let name = req.headers.cookie.split('name=')[1].split(';')[0];
	name = name.split('%20')[0]

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		let dbo = db.db('userdb')
		dbo.collection('watchlist').findOne({userEmail: res.locals.email}, async (error, result) => {
			if (error) throw error;
			await result
			for (const element of result.ticker){
				if (element.name === res.locals.tickername){
					return res.render('watchlist.ejs', {name: name, error: 'You cannot add duplicates to your watchlist.'})
				}
			}
			next();
		})
	})
}

router.post('/watchlist', searchWatchlist, (req, res)=>{
	// Unsubscribe
	var unsubscribe = function(symbol) {
		socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}));
	}

	const socket = new WebSocket('wss://ws.finnhub.io?token=c3ij7qaad3ib8lb87b3g');
	// Connection opened -> Subscribe
	socket.addEventListener('open', function (event) {
		socket.send( JSON.stringify({'type':'subscribe', 'symbol': res.locals.tickername}))
	});		

	// Listen for messages
	socket.addEventListener('message', async function (event) {
		res.locals.arr = await JSON.parse(event.data);
		//if error occurs with request return home
		if (res.locals.arr.type === "ping"){

			return res.redirect('/home')
		}
		else{			
			let fixedPrice = res.locals.arr.data[0].p.toFixed(2)
			unsubscribe(res.locals.tickername);
			socket.close();		
			MongoClient.connect(url, {useUnifiedTopology: true}, async function(err, db){
			if (err) throw err;
			let dbo = db.db('userdb')
			await dbo.collection("watchlist").updateOne(
				{
					userEmail: res.locals.email
				},
				{
					$push:  {ticker: {name: res.locals.arr.data[0].s, price: fixedPrice} }
				}
			)	
			res.redirect('/home')
			})	
		}
	})
})

module.exports = router;
