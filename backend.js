const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const validator = require('validator');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'nodelogin'
});

const app = express();

app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});
// http://localhost:3000/register
app.get('/register', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/register.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [ username, password ], function(
			error,
			results,
			fields
		) {
			// If there is an issue with the query, output the error
			if (error) {
				console.log(error);
			}
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// redirect to home page
		response.send('Welcome back, ' + request.session.username + '!');
		//display the data from the database
		console.log(connection);
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

// http://localhost:3000/register/new
app.post('/register/new', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	let email = request.body.email;

	// Check if name or about field is empty
	if (validator.isEmpty(username) || validator.isEmpty(password)) {
		response.send('Name or password field is empty');
	} else if (!validator.isEmail(email)) {
		// Check if email format is correct
		response.send('Email format is incorrect');
	} else {
		//sanitize the input
		cleanName = validator.escape(username);
		cleanPassword = validator.escape(password);
		cleanEmail = validator.escape(email);
		// query to insert into database
		connection.query(
			'INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)',
			[ cleanName, cleanEmail, cleanEmail ],
			function(error, results, fields) {
				// If there is an issue with the query, output the error
				if (error) {
					response.send(error, 'Error', fields, results);
					console.log(error);
				} else {
					response.redirect('/');
					console.log('Account created', fields, results);
				}
				response.end();
			}
		);
	}
});

// http://localhost:3000/list

app.get('/listmember', function(request, response) {
	//this code will display the data from the database
	connection.query('SELECT * FROM accounts', function(error, results, fields) {
		// If there is an issue with the query, output the error
		if (error) {
			console.log(error);
		}
		//return the data as a json object
		console.log('printing results');
		response.json(results);
	});
});

app.listen(3000);

// create user friend@'172.20.201.23.A' identified by 'pword';
// create user friend@'172.26.16.1.B' identified by 'pword';
// mysql --user friend --host '172.26.16.1' --password='pword'
// mysql --user friend --host '172.20.201.108' --password='pword'
