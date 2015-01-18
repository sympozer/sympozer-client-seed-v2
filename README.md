# sympozer-client-seed-v2
This repository contains the architecture of the angular client of sympozer V2


# Prerequisits

You need nodejs to be installed on your machine.

# Install

1) Install the node packages : npm install
2) Install grunt-cli to run grunt cmd : npm install -g grunt-cli
3) Copy a version of local-config.TEMPLATE to local-config.json to the root folder : cp local-config.json.TEMPLATE  local-config.json
4) Edit your local-config.json file to select your favorite browser process
5) Lauch the installer : sudo grunt install
6) To launch the app, start the "dev" task : sudo grunt dev


# Useful cmd :

A few grunt tasks are available in the Gruntfile.js :

update_dependencies : update bower dependencies
dev       : start a new server on localhost:9001 starting with /app repository and open the navigator
prod      : start a new server on localhost:9002 starting in /dist repository and open the navigator
build     : minimify / concatenate assets and copy everything to the /dist directory
test:unit : run karma test (currently unavailable)
test:e2e  : run protractor test (currently unvavailable)