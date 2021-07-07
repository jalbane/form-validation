const mongoose=require('mongoose');
const {Schema} = mongoose

const watchlist = new Schema({
	userEmail: {
		type: String,
		required: true,
	},
	ticker: [
		
	]
})

module.exports = mongoose.model('watchlist', watchlist)