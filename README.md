# REST API for SparkRentals Project
## !OPS!
***Unfortunately, the program is not ready and will not be ready for launch until December 13.***
## Content
- [About](#about)
- [Download](#download)
- [Usage](#usage)
- [Version](#version)
- [Contact](#contact)
## About
### Background
The REST API will be the very foundation of the entire SparkRentals system for everything to work where the clients such as "User Web Client", "User Mobile app" and "Admin Dashboard" will be able to get the information they need but also be able to update and delete things in the database.

The client will use NodeJS and Express where it handles requests from the web clients, which then the REST API will either update the database and then send out information or just send out information to the web clients depending on what kind of requests the clients make. REST API client will update / retrieve information from the local database mongoDB.

### Documentation
The REST API's documentation is a postman page where you can, among other things, see all functions with what kind of routes it is and what should be sent in to the REST API.

Link: <https://documenter.getpostman.com/view/20226369/2s8YepsYD6>

### Authentication
#### Authentication with api key
In order for the web clients to be able to update, delete, add and retrieve information from the database, the clients must have a valid api key to be able to authenticate to the REST API. If you do not enter a valid api key that has been created, the request will be blocked and a response will be returned stating that you did not enter a valid key.

### Authentication with Oauth 2.0
Some routes require a valid Bearer Token set in the HTTP header. The header 'Authorization' should contain a Bearer token from Oauth 2.0. This token is created when a user logs into their account through the third-party provider. If nothing is sent in Authorization or if the Oauth 2.0 token is incorrectly specified, the REST API blocks the request and sends back a response that either a token has not been specified or that the Oauth 2.0 token is incorrect.

### Authentication with x-access-token
Some routes require a valid JSON Web Token (JWT) set in the HTTP header. The header 'x-access-token' should contain a JWT token. This token is created when an admin / simulator logs into its account. If nothing is sent with the token or if the JWT token is incorrectly specified, the REST API blocks the request and sends back a response that either an x-access token has not been specified or that the JWT token is incorrect.

## Download
## Usage
## Version
## Contact
Have any questions?


Reach me at:


<falkendev@gmail.com>


<https://www.twitch.tv/falkendev>
## License and Tools
