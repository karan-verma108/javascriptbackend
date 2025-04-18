1) HTTP :-

HyperText Transfer Protocol, it's not secured meaning the data is visible that's transferred over the server. HTTP uses port 80

2) HTTPS : 

HTTP with Security (SSL - Secure Sockets Layer/TLS - Transport Layer Security)
SSL is the older version and now it's outdated whereas TLS is the new version and is in use presently.  So TLS is the set of security protocols that are used by browsers to secure the data when shared over networks or from one website to another. 

Think of SSL/TLS as a wrapper that wraps your data before it's sent to traval across internet

HTTPS uses port 443

3) URI :-  

Uniform Resourse Identifier, is't the umbrella term, meaning both URL (Uniform Resource Locator) and URN (Uniform Resource Name) comes under URI

URL = where + how (gives the path/location of the resource and how to access it)
URN = what it is (just gives the unique name of the resource but not its location)

4) HTTP Headers :-  

HTTP Headers are the metadata that's sent with every HTTP request. HTTP headers don't contain the actual data that is being sent but it contains information about the data like

i) what type of data it is, ii) how to handle it iii) who's sending it etc

Types of headers -> i) request headers (headers/metadata coming from the client) ii) response headers (headers/metadata coming from the server) iii) representation headers (encoding/compression) iv) payload headers

# Steps to register a user:

i) take details like name, address, email etc
ii) while email has been taken and during submission of the form, if it already exists, give a message "user already exists"
iii) if email doesn't already exist in the db, then proceed with the form submission (with the entered data)
iv) check for any validation errors by user, give them proper error messages if any entered input fails the required conditions like that for an email, we have some rules to be followed for an appropriate email
v) if there are no such errors then proceed with the data 
vi) while taking user's password and submitting the form, hash the password to store not the literal password in the db but rather the hashed one so that we follow all the security and privacy measures
vii) now if there is any error from the client (user's) side maybe in relation to network (internet) this time, then show appropriate message to the user
viii) if it's not the case, but the form submision fails due to server error, then show appropriate message to the user
ix) if there's no such issue, then submit the form and save the values to the db
x) lastly show a success alert/message to the user, stating the form has been submited

# Access tokens and Refresh tokens:


i) Access Token

a) Short-lived: Typically valid for minutes to an hour.
b) Purpose: Used to access protected resources/APIs (e.g., user profile, dashboard).
c) Storage: Usually stored in memory (e.g., local variables) to minimize exposure to XSS attacks.

⚠️ Should not be stored in localStorage or sessionStorage due to XSS risks.

ii) Refresh Token

a) Long-lived: Valid for hours to weeks, depending on implementation.
b) Purpose: Used to obtain new access tokens without requiring the user to log in again.
c) Storage: Stored in HttpOnly, Secure cookies, which are inaccessible to JavaScript.
d) HttpOnly: Protects against XSS attacks.
e) Secure: Ensures the cookie is sent only over HTTPS.

🔐 Must be protected against CSRF attacks, usually by using same-site cookies, anti-CSRF tokens, or requiring the use of refresh tokens only from trusted backends.

# Steps to login a user:

i) Obtain credentials entered by user
ii) Check if email/username exists in the db
iii) If doesn't exist, give message, 'User doesn't exist, register first'
iv) If exist, check if password matches with the entered password
v) If not, give message, 'password doesn't match, try again or reset password'
vi) If yes, then allow the user to login while passing access and refresh tokens to user
vii) send cookie
