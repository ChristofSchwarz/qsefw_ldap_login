/*
============================================================================================
Sample authentication app for Qlik Sense based LDAP.
============================================================================================
*/
var fs = require('fs');
var https = require('https');
//var http = require('http');
var express=require('express');
//var url= require('url');
// Use LDAP
var ldap = require('ldapjs');
//var session = require('express-session');
var bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
//var querystring = require("querystring");

// Use this certificates for the Express https server
var httpsoptions = {
	//pfx: fs.readFileSync(config.certificateConfig.serverCertFile),
	cert: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\server.pem'),
	key: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\server_key.pem'),
    //passphrase: ''
};
var config={};

config.port='4443'; //Port you want Node.js to listen to for authentication requests. 
//If you're using the login page as the "landing page" instead of redirecting from a virtual proxy
// - make sure you set up this URI to redirect the user after authenticating and receiving a ticket 
config.publicQlikTarget=`https://52.174.234.239/corpuls/hub`;  // <- browser redirect if custom virtual proxy is used
//config.publicQlikTarget=`https://52.174.234.239/hub`;  // <- browser redirect if default virtual proxy is used
config.LDAP='ldap://localhost:389/';  // path for the LDAP server 
//config.queryPattern = 'cn=$(uid)'; // <- mark the place with $(uid) where the userid should be put
config.queryPattern = 'uid=$(uid),ou=users,dc=corpulsweb,dc=com'; // <- mark the place with $(uid) where the userid should be put
//Specify the name of the user directory you want to use for the Qlik Sense ticket requests
config.qlikUserDir = 'CORPULSWEB.COM';


var qpsOptions = {
	method: 'POST',
	hostname: 'localhost', // <- hostname how this app.js can contact QPS API of Qlik Sense,
	port: 4243,
	path: '/qps/corpuls/ticket?xrfkey=0123456789ABCDEF',   // <- if custom virtual proxy is used
	//path: '/qps/ticket?xrfkey=0123456789ABCDEF',  // <- if default virtual proxy is used
	headers: {
		"x-qlik-xrfkey": '0123456789ABCDEF',
		"Content-Type": 'application/json'
	},
	cert: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client.pem'),
	key: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client_key.pem'),	
	rejectUnauthorized: false				
};


var app = express();
//set the port for the listener here
app.set('port', config.port);
// use contents from subfolder /public
app.use('/public', express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
	console.log('Get / received');
    console.log("Root request, received:", req.query);
    res.sendFile(__dirname + '\\login.html');
 });

// the login.html submits a post request from login form
app.post("/auth", function(req, res) {
	var url = config.LDAP; //req.session.LDAP;
	var userPrincipalName = config.queryPattern.replace('$(uid)', req.body.uid);
	var userLoginId = req.body.uid;
	var passwd = req.body.passwd;

	// Bind as the user
	console.log({ url: url, reconnect: true });
	var adClient = ldap.createClient({ url: url, reconnect: true });
	console.log(`Logging in as ${userPrincipalName}`);
	adClient.bind(userPrincipalName, passwd, function(err) {
		if (err != null) {
			console.log('Error occured in ldap call');
			console.log(err);
			if (err.name === "InvalidCredentialsError")
				res.redirect("/?login=failed&reason=credentials");
			else
				res.redirect("/?login=failed&reason=unknown");
		} else {
			console.log('Authentication successful');
			
			var ticketReq = https.request(qpsOptions, function (ticketRes) {
				var chunks = [];
				ticketRes.on("data", function (chunk) {
					chunks.push(chunk);
				});
				
				ticketRes.on("end", function (chunk) {
					var body = Buffer.concat(chunks);
					console.log('Ticket received.');
					var response=body.toString();
					response = JSON.parse(response);
					console.log(config.publicQlikTarget + '?qlikticket=' + response.Ticket);
					res.redirect(config.publicQlikTarget + '?qlikticket=' + response.Ticket);
				});
				
				ticketRes.on("error", function (error) {
					console.error(error);
				});
			});
			var postData = JSON.stringify({UserDirectory: config.qlikUserDir, UserId: userLoginId});
			ticketReq.write(postData);  // contact /ticket endpoint with POST call
			ticketReq.end();
		}  // End of the if err == null part
		adClient.unbind(err=>{});
	});  // End of the function called by adClient.bind
	
	//adClient.on('error', function(err) {
	//	console.log('ERROR THROWN', err);
	//});
});


//Start listener
var server = https.createServer(httpsoptions, app);
server.listen(app.get('port'), function()
{
  console.log('Express server listening on port ' + app.get('port'));
});
//server.on('error', function(err) { "Error thrown", err });

process.on('uncaughtException', function (err) {
  //console.error(err.stack);
  console.log('Error', err);
});
