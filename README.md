# sympozer-client-seed-v2
This repository contains the architecture of the angular client of sympozer V2


# Prerequisits

You need nodejs to be installed on your machine.

# Install

* 1) Install the node packages : npm install
* 2) Install grunt-cli to run grunt cmd : npm install -g grunt-cli
* 3) Copy a version of local-config.TEMPLATE to local-config.json to the root folder : cp local-config.json.TEMPLATE  local-config.json
* 4) Edit your local-config.json file to select your favorite browser process
* 5) Launch the installer : sudo grunt install
* 6) If you have problems downloading the zip file, execute the following :
     - cp utils/selenium-server-standalone-2.42.2.jar node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar
     - cp utils/chromedriver node_modules/protractor/selenium/chromedriver

* 7) To launch the app, start the "dev" task : sudo grunt dev


# Useful cmd :

A few grunt tasks are available in the Gruntfile.js :

* update_dependencies : update bower dependencies
* dev       : start a new server on localhost:9001 starting with /app repository and open the navigator
* prod      : start a new server on localhost:9002 starting in /dist repository and open the navigator
* build     : minimify / concatenate assets and copy everything to the /dist directory
* test:unit : run karma test
* test:e2e  : run protractor test on test server (0.0.0.0:9002, needs to be started first with grunt connect:testserver)
