#!/usr/bin/env bash

apt-get update

# add additional repositories
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update

# install dependencies
sudo apt-get install -y npm --force-yes
sudo apt-get install -y mongodb-org --force-yes

sudo npm install
sudo npm install bower -g
sudo npm install forever -g

cd modified_node_modules/gulp-hogan-compile
sudo npm install
cd ../..

bower install --allow-root 

#install application
sudo npm run-script seed
sudo npm start
