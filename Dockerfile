
FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

WORKDIR /usr/src/app/app

RUN npm install

RUN npm install -g angular-cli

RUN ng build

WORKDIR /usr/src/app

EXPOSE 8080

CMD [ "npm", "start" ]



