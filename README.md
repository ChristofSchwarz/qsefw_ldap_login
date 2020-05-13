# LDAP Login Solution
NodeJS LDAP Login Solution for Qlik Sense Enterprise for Windows. This app is meant to run on the same machine as Qlik Sense Enterprise for Windows (on the proxy node). Since Qlik Sense uses Node.exe (NodeJS) already, you do NOT need to install NodeJS. You can install it, however, in this case you also install NPM, the package manager, and you can update the dependencies.

| Tables |
| ------ |

To run this:
 * Clone or download/extract this repo into a folder of your choice
 * Edit <a href="config.js">config.js</a> and make the necessary adjustments. Remember that the virtualproxy which you configure here needs to be setup in the following step (below)
 * if you have "npm" (node package manager) you can delete the subfolder "node_modules", open a Command Prompt in the root folder of this app, and run "npm install" to download the <a href="package.json">necessary dependencies</a>
 
To run the app, execute <a href="run.bat">run.bat</a>. This runs the node.exe from the default Qlik Sense program folder. This will start the app and expose a https <a href="login.html">webpage</a> on the port defined in config.js. 

## Setup a Virtual Proxy on Qlik Sense QMC

Login as Root Admin to the QMC of Qlik Sense. 
 * Go to /qmc/virtualproxies
 * Create new Virtual Proxy 
 * Make below settings. The "Authentication module redirect URI" should be the url (including port) of this app.js
![screenshot](/public/screenshot.png "screenshot") 
 * Save settings, then go to "Associated items" / "Proxies" and (+ Link) the Central Proxy, otherwise this Virtual Proxy will not work
 

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
