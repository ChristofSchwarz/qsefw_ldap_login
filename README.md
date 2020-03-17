# LDAP Login Solution
NodeJS LDAP Login Solution for Qlik Sense Enterprise for Windows



## Use Qlik Sense Service Dispatcher to run app.js
Edit "C:\Program Files\Qlik\Sense\ServiceDispatcher\services.conf" and add this lines at the bottom (replace the Script entry with the file location of this app.js):
```
[ldaplogin]
Identity=cswLdapLogin
Enabled=true
DisplayName=cswLdapLogin
ExecType=nodejs
ExePath=Node\node.exe
Script=C:\Users\corpulsadm\Documents\Qliklogin-master\app.js
```
Restart the Windows service "Qlik Sense Service Dispatcher". 
