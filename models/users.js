const mongoose=require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
	userEmail: {
		type: String,
		required: true,
	},
	userName: {
		type: String,
		required: true,
	},
	userPassword: {
		type: String,
		required: true,
	},
})

module.exports = mongoose.model('Users', userSchema)