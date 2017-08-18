# RAPT-AMT-August2017-UI
Interface for Amazon Mechanical Turk for Dialogue Annotation.
The current version is built for annotating self-disclosure but can be modified for any purpose


<h2> Setting up the mTurk Annotation Interface </h2>
<strong>Prepare the APIs within the Woz_interfaceNode folder</strong> <br />
Make sure you have the latest version of node installed.
In terminal:
- npm install -g n
Or to upgrade it:
-sudo n latest

Then change directory to your Woz_interface_Node folder, within your AlgebraInterface folder.
- cd views/APIs/KAS <br />
- npm install <br />
- npm install -g grunt <br />
- grunt parser <br />
<br />
<strong>Prepare and run the algebra interface node server</strong> <br />
- npm install jsonfile <br />
- npm install firebase <br />
- npm install mathsteps <br />
- node server.js <br />
- In browser, go to http://localhost:3000 <br />
<br />
<br />

Created by Jeffrey Li Summer 2017. Contact him at jyli1@andrew.cmu.edu
