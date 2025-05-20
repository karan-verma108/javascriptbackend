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


# To logout a user:

i) Clear the cookies first (access token, refresh token)
ii) Reset/delete the refresh token stored in the db corresponding to that user (because we dont want user to keep using that refresh token and keep requesting new access tokens to keep them logged in)

# Let's understand more about access token and refresh token (session token):

When a user logs in, they get an access token, that's short lived. A refresh token for that respective user is stored in the database. Now, till the access token is valid and not expired, user can access or explore all the restricted content on the website. The moment the access token is invalidated/gets expired, then if user tries to access the same restricted content or resource so they would get a 401 (unauthorized) error. This is because now the access token is invalidated/expired. So now the user will have to login again in order to generate a new access token (and a new refresh token will also be generated, that will be stored in the database for that respective user). Another way, a more convenient way, for users is, to monitor the 401 state, so when the 401 error comes, we can redirect user to a new path/url/route wherein, without having to login again, they'd be prompted to simply hit a new request (for refreshing the access token), there we (the client) pass the existing refresh token in the request and compare that with the refresh token that's present in the database, if both are equal, so a new session is started by generating new access and refresh token (hence not needing to login again).

A more technical explaination below 👍

When a user logs in, they receive an access token, which is short-lived and used to access protected resources. Along with this, a refresh token is issued and stored securely in the database for that specific user.
As long as the access token is valid (i.e., not expired), the user can access restricted content on the website. Once the access token expires or becomes invalid, any attempt to access protected resources will result in a 401 Unauthorized error.

At this point, the user has two options:
Manual re-authentication: The user logs in again to obtain a new access token and a new refresh token (which replaces the old one in the database).
Token refresh flow (preferred): The application detects the 401 response and redirects the user to a route that silently handles token refreshing. In this flow:

The client sends the existing refresh token to the server.
The server verifies the refresh token by comparing it with the one stored in the database.
If valid, the server issues a new pair of access and refresh tokens and updates the database accordingly.
This allows the user to continue without having to log in again.
This flow improves the user experience by maintaining sessions seamlessly without frequent re-authentication.

# How to refresh the access token 👍

Note : When initially the refresh token is generated (along with access token when user logs in, we send the refresh token to user in an encrypted form while we store the same in the db, in a decrypted form)

i) So the process would be like, first we have to obtain the refresh token sent by the user (client) through cookies or through the request body,
ii) Then, we neen to verify this incoming refresh token using the verify method of jsonwebtoken to make sure that it passes the token secret signature that we've stored in the .env file
iii) Once this is done, we will get a decoded version of this incoming refresh token
iv) Now, we have an incoming token and we need to compare it with the refresh token stored in the db
v) from the decoded refresh token we can easily get the _id field, so use it make a query to the db to fetch refresh token corresponding to that _id
vi) We would have a new refresh token that's been fetched from the db.
viii) Now if both of these refresh tokens don't match so give an error that the tokens are invalid.
ix) Otherwise, generate a new set of refresh and access tokens using the generateAccessAndRefreshToken method
x) While the process is continuing, also geneate cookies again with new values for access and refresh token

# How to change the password 👍

i) obtain old password and new password from the user
ii) also obtain the current user's details
iii) if the old password matches with the password stored in the db w.r.t. that user, then proceed further, else exit the process by giving an error
iv) reassign the password field in the user object with the new password obtained from the req.body
v) return a OK response to the user stating password has been changed/updated

# How to get the current user 👍

i) check if user is logged in,
ii) if true, then get the user object from request object
iii) return that user object as a response