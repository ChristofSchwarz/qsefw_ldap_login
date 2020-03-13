

var ldap = require('ldapjs');
var client = ldap.createClient({
  url: 'ldap://localhost:389'
});
// ldapadmin		ldapadmin123
var user = 'uid=csw,ou=users,dc=corpulsweb,dc=com'; // <- OK!
var pass = 'Password123!';
//var user = 'cn=ldapadmin,dc=corpulsweb,dc=com';  // <- OK!
//var pass = 'ldapadmin123';
console.log(user);
client.bind(user, pass, function(err) {
//client.bind('dn=ldapadmin', 'ldapadmin123', function(err) {
    if(err){ console.log('Error', err); }
    console.log('done');
    client.unbind(err=>{});
  });

var https=require('https');
var fs=require('fs');

var config={};
// Qlik Sense server certificates location
config.clientCertFile='C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client.pem';
config.clientCertKey='C:\\ProgramData\\Qlik\\Sense\\Repository\\Exported Certificates\\.Local Certificates\\client_key.pem';

  var options = {
    method: 'POST',
    hostname: 'localhost',
    port: 4243,
    path: '/qps/ticket?xrfkey=0123456789ABCDEF',
    rejectUnauthorized: false,
    headers: {
      "x-qlik-xrfkey": '0123456789ABCDEF',
      //"X-Qlik-User": 'UserDirectory=Internal;UserId=sa_proxy',
      "Content-Type": 'application/json'
    },
    key: fs.readFileSync(config.clientCertKey),
    cert: fs.readFileSync(config.clientCertFile),					
  };
    
  var req = https.request(options, function (res) {
  var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
    
    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log('Finished! Ticket received');
      console.log(body.toString());
    });
    
    res.on("error", function (error) {
      console.error(error);
    });
    });
    
    var postData = JSON.stringify({UserDirectory: 'CORPULSWEB.COM', UserId: 'userLoginId'});
    req.write(postData);
    req.end();  