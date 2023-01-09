# REST API for SparkRentals Project
## Content
- [About](#about)
- [Download](#download)
- [Usage](#usage)
- [License and Tools](#license-and-Tools)
## About
This project is created by 4 students who attend Blekinge Institute of Technology in web programming. We were given the task of creating a system for a scooter company where we would, among other things, create a mobile-adapted web app for the customer, administrative web interface, a simulation program for the electric scooters, an intelligence program in the bicycle and a Rest API that distributes and retrieves information from the entire system and stores the information on a database.

The entire project is available at: https://github.com/FalkenDev/V-Team-SparkRentals

### Background
The REST API will be the very foundation of the entire SparkRentals system for everything to work where the clients such as "User Web Client", "User Mobile app" and "Admin Dashboard" will be able to get the information they need but also be able to update and delete things in the database.

The client will use NodeJS and Express where it handles requests from the web clients, which then the REST API will either update the database and then send out information or just send out information to the web clients depending on what kind of requests the clients make. REST API client will update / retrieve information from the local database mongoDB.

### Documentation
The REST API's documentation is a postman page where you can, among other things, see all functions with what kind of routes it is and what should be sent in to the REST API.

Link: <https://documenter.getpostman.com/view/20226369/2s8YepsYD6>

### Authentication
#### Authentication with API KEY
In order for the web clients to be able to update, delete, add and retrieve information from the database, the clients must have a valid api key to be able to authenticate to the REST API. If you do not enter a valid api key that has been created, the request will be blocked and a response will be returned stating that you did not enter a valid key.

### Authentication with Oauth 2.0
Some routes require a valid Access Token set in the HTTP header as access_token. The header 'Authorization' should contain a Access token from Google Oauth 2.0. This token is created when a user logs into their Google Account through the Google provider. If nothing is sent in Authorization or if the Oauth 2.0 token is incorrectly specified, the REST API blocks the request and sends back a response that either a token has not been specified or that the Oauth 2.0 token is incorrect. As in login the token only saves it as a secret cookie and not need to use the authorization Token.

### Authentication with x-access-token
Some routes require a valid JSON Web Token (JWT) set in the HTTP header. The header 'x-access-token' should contain a JWT token. This token is created when an admin, user or the simulator program logs into its account. If nothing is sent with the token or if the JWT token is incorrectly specified, the REST API blocks the request and sends back a response that either an x-access token has not been specified or that the JWT token is incorrect.

## Download
### Required environment variables
***.env:***

    # Rest API
    API_TOKEN=[array with api tokens]
    JWT_SECRET="Your secret jwt code"
    REST_API_PORT="The port the the rest api should run on"
    
    # For the access rights through Rest API
    REACT_APP_ADMIN_API_KEY="Admin Dashboard API Token"
    REACT_APP_USER_MOBILE_API_KEY="Mobile Client API Token"
    REACT_APP_USER_WEBB_API_KEY="User Webb Client API Token"

    # When using local (MongoDB)
    DBURI="mongodb://localhost:27017"

    # GOOGLE Oauth
    GOOGLE_CLIENT_ID="Google Client ID"
    GOOGLE_CLIENT_SECRET="Google Secret Code"

    # Google routes localy
    GOOGLE_CALLBACK_URL=**"http://localhost:8393/v1/auth/google/callback"**
    GOOGLE_SUCCESS_URL=**"http://localhost:3000/login/google/success"**
    GOOGLE_FAILURE_URL=**"http://localhost:3000/login/google/failure"**

    # Cookie
    COOKIE_KEY="Cookie Secret Code"

    # JWT expire time for user token (x-access-token)
    # Set to 1h
    JWT_USER_TOKEN_EXPIRE=3600

    # JWT expire time for user token (x-access-token)
    # Set to 1h
    JWT_ADMIN_TOKEN_EXPIRE=3600

    # If the cluster should be on or not
    API_CLUSTER=**true**

### Run it localy
- Fork the project / donwload the project.

>npm install

- Create .env file and insert the environment variables and change the inputs.

>node app.js

### Run it on Docker
***OPS! Don't forget to send your env file in docker run command***
> docker run -it falkendev/spark-rentals-api:latest

## Usage
***Node Version: v18.12.0***
To use the api: http://localhost:8393/v1/

## License and Tools
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) 

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-REST-API/badges/quality-score.png?b=dev)](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-REST-API/?branch=dev) [![Build Status](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-REST-API/badges/build.png?b=dev)](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-REST-API/build-status/dev)

