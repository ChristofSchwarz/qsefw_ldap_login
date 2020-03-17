var fs = require('fs');
var config = {}

// -------- Express Server Settings --------

config.expressServerPort = 4443; //Port you want Node.js to listen to for authentication requests. 
// settings to serve https using Express. Use server certificates in pem or pfx format.
config.expressServerOptions = {
	//pfx: fs.readFileSync('......'),
	cert: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\server.pem'),
	key: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\server_key.pem'),
    //passphrase: ''
};

// -------- Qlik Sense QPS API Settings --------
config.virtualProxy = 'corpuls'; // if no virtual proxy is used, leave blank '' 
if (config.virtualProxy.length > 0 && config.virtualProxy.substr(-1)!='/') config.virtualProxy += '/';  // end vp with "/" if not blank
config.staticUserDir = 'CORPULSWEB.COM' // User Directory string used in Qlik
config.postLoginRedirect = `https://$(hostname)/${config.virtualProxy}hub`;  // address in Qlik Sense to go after login 
  // you can use $(hostname) to dynamically put the same host as given in the browser instead of a hardcoded Qlik server name
config.qpsOprions = {
    hostname: 'localhost', // <- hostname how this app.js can contact QPS API of Qlik Sense,
    port: 4243,  // QPS API port
    // certificates to use when talking to the QPS API
	cert: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client.pem'),
	key: fs.readFileSync('C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client_key.pem'),	
	rejectUnauthorized: false		    
}

// -------- LDAP Settings --------

config.ldap = {
    url: 'ldap://localhost:389/',  // path for the LDAP server 
    // queryPattern: 'cn=$(uid)', // <- mark the place with $(uid) where the userid should be put
    queryPattern: 'uid=$(uid),ou=users,dc=corpulsweb,dc=com', // <- mark the place with $(uid) where the userid should be put
}
 
//Specify the name of the user directory you want to use for the Qlik Sense ticket requests


module.exports = config;
