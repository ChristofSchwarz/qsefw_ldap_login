

var ldap = require('ldapjs');
var client = ldap.createClient({
  url: 'ldap://localhost:389'
});
var user = 'uid=csw,ou=users,dc=corpulsweb,dc=com'; // <- OK!
var pass = 'Password123!';
console.log(user);
client.bind(user, pass, function(err) {
//client.bind('dn=ldapadmin', 'ldapadmin123', function(err) {
    if(err){ console.log('Error', err); }
    console.log('ldap binding ok.');
    client.unbind(err=>{});
});
