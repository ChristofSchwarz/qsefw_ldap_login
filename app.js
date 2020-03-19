/*
============================================================================================
Sample authentication app for Qlik Sense based on LDAP.
============================================================================================
*/
//var fs = require('fs'); 
var https = require('https');
//var http = require('http');
var express=require('express');

// Use LDAP
var ldap = require('ldapjs');
var bodyParser = require('body-parser');
var config = require('./config');
//console.log(config);

function textBetween(source,start,end) {
	var part = source.split(start)[1]; 
	if (part) part = part.split(end)[0];
	return part;
}
function removeQueryString(url, queryString) {
	var errorTxt = textBetween(url, queryString+'=', '&');
	url = url.replace(queryString + '=' + errorTxt, '').replace('?&', '?').replace('&&','&');
	if (url.substr(-1) == '?') url=url.substr(0,url.length-1);
	if (url.substr(-1) == '&') url=url.substr(0,url.length-1); 
	return url;
}

var app = express();
//set the port for the listener here
app.set('port', config.expressServerPort);
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
	var userLoginId = req.body.username;  // get the post-form values username and pwd
	var passwd = req.body.pwd;
	var browserHostName = req.headers.host.split(':')[0]; // hostname without port
	var targetId = textBetween(req.headers.referer, 'targetId=', '&');
	// remove the 'error=xyz' part from the url
	var onErrorReturnTo = removeQueryString(req.headers.referer, 'error');
	onErrorReturnTo += (onErrorReturnTo.indexOf('?') > -1) ? '&' : '?';
	//console.log(req.headers);
	
	var url = config.ldap.url; //req.session.LDAP;
	var userPrincipalName = config.ldap.queryPattern.replace('$(uid)', userLoginId);
	
    // Bind as the user
	console.log({ url: url, reconnect: true });
	var adClient = ldap.createClient({ url: url, reconnect: true });
	console.log(`Logging in as ${userPrincipalName}`);
	adClient.bind(userPrincipalName, passwd, function(err) {
		if (err != null) {
			console.log('Error occured in ldap call');
			console.log(err);
			if (err.name === "InvalidCredentialsError")
				res.redirect(onErrorReturnTo + 'error=Invalid%20credentials');
			else
				res.redirect(onErrorReturnTo + 'error=Unknown%20error');
		} else {
			console.log('Authentication successful');

			var qpsGetTicketOptions = { ...config.qpsOprions, ...{
				method: 'POST',
				path: `/qps/${config.virtualProxy}ticket?xrfkey=0123456789ABCDEF`,
				headers: {
					"x-qlik-xrfkey": '0123456789ABCDEF',
					"Content-Type": 'application/json'
				}			
			}};			

			var ticketReq = https.request(qpsGetTicketOptions, function (ticketRes) {
				var chunks = [];
				ticketRes.on("data", function (chunk) {
					chunks.push(chunk);
				});
				
				ticketRes.on("end", function (chunk) {
					var body = Buffer.concat(chunks);
					var response=body.toString();
					console.log('Ticket received.');
					response = JSON.parse(response);
					var targetUri;
					if (response.TargetUri) {
						targetUri = response.TargetUri;
					} else {
						targetUri = config.postLoginRedirect.replace('$(hostname)', browserHostName);
					}
					targetUri += (targetUri.indexOf('?') > -1)? '&' : '?';
					targetUri += 'qlikticket=' + response.Ticket;
					console.log(targetUri);
					res.redirect(targetUri);
				});
				
				ticketRes.on("error", function (error) {
					console.error(error);
				});
			});
			var postData = {
				UserDirectory: config.staticUserDir, 
				UserId: userLoginId
			};
			if (targetId) postData.targetId = targetId;
			ticketReq.write(JSON.stringify(postData));  // contact /ticket endpoint with POST call
			ticketReq.end();
		}  // End of the if err == null part
		adClient.unbind(err=>{});
	});  // End of the function called by adClient.bind
	
	//adClient.on('error', function(err) {
	//	console.log('ERROR THROWN', err);
	//});
});


//Start listener
var server = https.createServer(config.expressServerOptions, app);
server.listen(app.get('port'), function()
{
  console.log('Express server listening on port ' + app.get('port'));
});
//server.on('error', function(err) { "Error thrown", err });

process.on('uncaughtException', function (err) {
  //console.error(err.stack);
  console.log('Error', err);
});
