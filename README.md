# 4|Bar #

The following programs must be installed for 4|Bar to run:

* [NodeJS](https://nodejs.org/) or [IOJS](https://iojs.org/en/index.html)
* [MongoDB](https://www.mongodb.org/)

### Starting the Server ###

With nodejs or iojs installed run the command 'npm start' to start the server in the current shell. Then navigate to [localhost:3000](http://localhost:3000) to see the application.

The command 'npm run server' will make the server run in the background, it can be stopped by using 'npm stop'.

Please note that user login will not work as the OAuth system set up with Google+ requires the specific IP addresses of the servers that will be making the request. 

### Seeding Data ###

Use the command 'npm run seed' to seed the database with tunes from thesession.org

### NPM Packages ###
All required npm packages are included on the disk. If the server complains about missing a package try 'npm install' to reinstall all dependencies.