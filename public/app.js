const userEmail = document.getElementById('userEmail');
const userPassword = document.getElementById('userPassword');
const checkValidInput = new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{6,12}$/);
const errorMessage = document.getElementById('error');

const submitForm = (e) => {
	console.log('hello world')
	e.preventDefault();
	validateInput(userEmail.value, userPassword.value);
}

const validateInput = (email, password) => {
	if (!checkValidInput.test(email)){
		
		if (email.length < 6){
			errorMessage.innerText = 'Email must contain more than 6 characters.';
		}
		else if (email.length > 12){
			errorMessage.innerText = 'Email must contain less than 12 characters.';
		}
		else{
			errorMessage.innerText = 'Email must contain at least 1 alphabetic character, 1 number character';
		}
	}	
	else{
		errorMessage.innerText ='';	
		document.forms[0].submit();
	}
}