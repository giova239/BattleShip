"use strict";
/**
 *  HTTP REST server + MongoDB (Mongoose) + Express
 *
 *  Battleship Game backend
 *  The application also provide user authentication through JWT
 *  The provided APIs are fully stateless.
 *
 *
 *  Endpoints          Attributes          Method        Description
 *
 *     /                  -                  GET         Returns API version
 *     /users             -                  GET         List all users
 *     /users             -                  POST        if logged as ADMIN you can create new users
 *                                                       and give them roles
 *     /users/:mail       -                  GET         Get user info by mail
 *     /users/:mail       -                  DELETE      if logged as moderator delete the user
 *     /login             -                  POST        login an existing user, returning a JWT
 *     /register          -                  POST        creates a new User with no role
 * -----------------------------------------------------------------------------------------------------
 *     /friends           -                  GET         Retrive the logged user friendlist
 *     /pendingRequests   -                  GET         Retrive the logged user pending friends request
 *     /friends           -                  POST        A logged user adds his own id
 *                                                       on another user pending friend requests
 *                                                       if the other user already added you add
 *                                                       both ids in the respective friendlist
 * -----------------------------------------------------------------------------------------------------
 *     /chat/:userID      -                  GET         Retrive the chat history between the logged
 *                                                       and the user sent as param
 *     /chat/:userID      -                  POST        adds the message from the body to the chat
 *                                                       history between the users
 * -----------------------------------------------------------------------------------------------------
 *  To install the required modules:
 *  $ npm install
 *
 *  To compile:
 *  $ npm run compile
 *
 *  To setup:
 *  Create a file ".env" to store the JWT secret:
 *  JWT_SECRET=<secret>
 *  $ echo "JWT_SECRET=secret" > ".env"
 *
 *  To run:
 *  $ node run start
 */
Object.defineProperty(exports, "__esModule", { value: true });
const result = require('dotenv').config(); // The dotenv module will load a file named ".env"
// file and load all the key-value pairs into
// process.env (environment variable)
if (result.error) {
    console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
    process.exit(-1);
}
if (!process.env.JWT_SECRET) {
    console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
    process.exit(-1);
}
const http = require("http"); // HTTP module
const colors = require("colors");
colors.enabled = true;
const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectId;
const user = require("./User");
const chat = require("./Chat");
const express = require("express");
const bodyparser = require("body-parser"); // body-parser middleware is used to parse the request body and
// directly provide a JavaScript object if the "Content-type" is
// application/json
const passport = require("passport"); // authentication middleware for Express
const passportHTTP = require("passport-http"); // implements Basic and Digest authentication for HTTP (used for /login endpoint)
const jsonwebtoken = require("jsonwebtoken"); // JWT generation
const jwt = require("express-jwt"); // JWT parsing middleware for express
const cors = require("cors"); // Enable CORS middleware
const io = require("socket.io"); // Socket.io websocket library
var ios = undefined;
var app = express();
// We create the JWT authentication middleware
// provided by the express-jwt library.  
// 
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.
//
var auth = jwt({ secret: process.env.JWT_SECRET });
app.use(cors());
// Install the top-level middleware "bodyparser"
// body-parser extracts the entire body portion of an incoming request stream 
// and exposes it on req.body
app.use(bodyparser.json());
app.use((req, res, next) => {
    console.log("------------------------------------------------".inverse);
    console.log("New request for: " + req.url);
    console.log("Method: " + req.method);
    next();
});
/*----------------------------------------------------------------------------------------------------*/
// API ROUTES
/*----------------------------------------------------------------------------------------------------*/
app.get("/", (req, res) => {
    res.status(200).json({ api_version: "1.0" });
});
/*----------------------------------------------------------------------------------------------------*/
// USERS
/*----------------------------------------------------------------------------------------------------*/
app.get('/users', auth, (req, res, next) => {
    user.getModel().find({}, { digest: 0, salt: 0 }).then((users) => {
        return res.status(200).json(users);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.post('/users', auth, (req, res, next) => {
    var currentUser = user.newUser(req.user);
    if (!currentUser.hasAdminRole()) {
        return next({ statusCode: 404, error: true, errormessage: "Unauthorized: user is not an admin" });
    }
    var u = user.newUser(req.body);
    console.log(u);
    if (!req.body.password) {
        return next({ statusCode: 404, error: true, errormessage: "Password field missing" });
    }
    u.setPassword(req.body.password);
    u.save().then((data) => {
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch((reason) => {
        if (reason.code === 11000)
            return next({ statusCode: 404, error: true, errormessage: "User already exists" });
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
    });
});
app.get('/users/:mail', auth, (req, res, next) => {
    user.getModel().findOne({ mail: req.params.mail }, { digest: 0, salt: 0 }).then((user) => {
        return res.status(200).json(user);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.delete('/users/:mail', auth, (req, res, next) => {
    var currentUser = user.newUser(req.user);
    if (!currentUser.hasModeratorRole()) {
        return next({ statusCode: 404, error: true, errormessage: "Unauthorized: user is not a moderator" });
    }
    user.getModel().deleteOne({ mail: req.params.mail, roles: [] }).then(q => {
        if (q.deletedCount > 0)
            return res.status(200).json({ error: false, errormessage: "" });
        else
            return res.status(404).json({ error: true, errormessage: "Invalid mail" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
passport.use(new passportHTTP.BasicStrategy(function (username, password, done) {
    console.log("New login attempt from ".green + username);
    user.getModel().findOne({ mail: username }, (err, user) => {
        if (err) {
            return done({ statusCode: 500, error: true, errormessage: err });
        }
        if (!user) {
            return done(null, false, { statusCode: 500, error: true, errormessage: "Invalid user" });
        }
        if (user.validatePassword(password)) {
            return done(null, user);
        }
        return done(null, false, { statusCode: 500, error: true, errormessage: "Invalid password" });
    });
}));
app.get("/login", passport.authenticate('basic', { session: false }), (req, res, next) => {
    var tokendata = {
        username: req.user.username,
        roles: req.user.roles,
        mail: req.user.mail,
        id: req.user.id
    };
    console.log("Login granted. Generating token");
    var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
});
app.post('/register', (req, res, next) => {
    var u = user.newUser(req.body);
    u.roles = [];
    console.log(u);
    if (!req.body.password) {
        return next({ statusCode: 404, error: true, errormessage: "Password field missing" });
    }
    u.setPassword(req.body.password);
    u.save().then((data) => {
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch((reason) => {
        if (reason.code === 11000)
            return next({ statusCode: 404, error: true, errormessage: "User already exists" });
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
    });
});
/*----------------------------------------------------------------------------------------------------*/
// FRIENDS
/*----------------------------------------------------------------------------------------------------*/
app.get('/friends', auth, (req, res, next) => {
    user.getModel().findById(req.user.id).then(currentUser => {
        user.getModel().find({}, "username").where('_id').in(currentUser.friends).exec((err, records) => {
            return res.status(200).json(records);
        });
    });
});
app.get('/pendingRequests', auth, (req, res, next) => {
    user.getModel().findById(req.user.id).then(currentUser => {
        user.getModel().find({}, "username").where('_id').in(currentUser.pendingRequests).exec((err, records) => {
            return res.status(200).json(records);
        });
    });
});
app.post('/friends', auth, (req, res, next) => {
    user.getModel().findById(req.user.id).then(currentUser => {
        let friendID;
        friendID = req.body.friendID;
        if (friendID === currentUser._id.toString()) {
            return next({ statusCode: 404, error: true, errormessage: "You can't add yourself as a friend" });
        }
        user.getModel().findById(friendID).then(friend => {
            if (friend.pendingRequests.includes(currentUser._id)) {
                return next({ statusCode: 404, error: true, errormessage: "Friend request already sent" });
            }
            else if (friend.friends.includes(currentUser._id)) {
                return next({ statusCode: 404, error: true, errormessage: "You are already Friends" });
            }
            var index = currentUser.pendingRequests.indexOf(friend._id);
            if (index >= 0) {
                console.log("accepting friend request");
                currentUser.pendingRequests.splice(index, 1);
                currentUser.friends.push(friend._id);
                friend.friends.push(currentUser._id);
                currentUser.save();
                friend.save();
            }
            else {
                console.log("sending friend request");
                friend.pendingRequests.push(currentUser._id);
                friend.save();
            }
            return res.status(200).json({ error: false, errormessage: "" });
        }).catch(() => {
            return next({ statusCode: 404, error: true, errormessage: "User not found" });
        });
    });
});
/*----------------------------------------------------------------------------------------------------*/
//CHAT
/*----------------------------------------------------------------------------------------------------*/
app.get('/chat/:userID', auth, (req, res, next) => {
    try {
        var u1 = ObjectId(req.user.id);
        var u2 = ObjectId(req.params.userID);
    }
    catch (error) {
        return next({ statusCode: 404, error: true, errormessage: "Invalid UserID" });
    }
    chat.getModel().findOne({ $or: [
            { 'user1': u1, 'user2': u2 },
            { 'user1': u2, 'user2': u1 }
        ] }).then(chat => {
        return res.status(200).json(chat);
    }).catch(() => {
        return next({ statusCode: 404, error: true, errormessage: "Chat not found: " });
    });
});
app.post('/chat/:userID', auth, (req, res, next) => {
    var newMessage = {
        isFromUser1: true,
        date: new Date(),
        text: req.body.text
    };
    try {
        var u1 = ObjectId(req.user.id);
        var u2 = ObjectId(req.params.userID);
    }
    catch (error) {
        return next({ statusCode: 404, error: true, errormessage: "Invalid UserID" });
    }
    chat.getModel().findOne({ $or: [
            { 'user1': u1, 'user2': u2 },
            { 'user1': u2, 'user2': u1 }
        ] }).then(found => {
        if (found) {
            if (found.user2.toString() === u1.toString()) {
                newMessage.isFromUser1 = false;
            }
            found.messages.push(newMessage);
            found.save().then((data) => {
                return res.status(200).json({ error: false, errormessage: "" });
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
            });
        }
        else {
            var c = chat.newChat({
                user1: ObjectId(req.user.id),
                user2: ObjectId(req.params.userID),
                messages: [newMessage]
            });
            c.save().then((data) => {
                return res.status(200).json({ error: false, errormessage: "" });
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
            });
        }
    }).catch(error => {
        return res.status(200).json(error);
    });
});
/*----------------------------------------------------------------------------------------------------*/
// Add error handling middleware
app.use(function (err, req, res, next) {
    console.log("Request error: ".red + JSON.stringify(err));
    res.status(err.statusCode || 500).json(err);
});
// The very last middleware will report an error 404 
// (will be eventually reached if no error occurred and if
//  the requested endpoint is not matched by any route)
//
app.use((req, res, next) => {
    res.status(404).json({ statusCode: 404, error: true, errormessage: "Invalid endpoint" });
});
// Connect to mongodb and launch the HTTP server trough Express
//
mongoose.connect('mongodb://localhost/BattleshipDB')
    .then(() => {
    console.log("Connected to MongoDB");
    return user.getModel().findOne({ mail: "admin@battleship.it" });
}).then((doc) => {
    if (!doc) {
        console.log("Creating admin user");
        var u = user.newUser({
            username: "admin",
            mail: "admin@battleship.it"
        });
        u.setAdmin();
        u.setModerator();
        u.setPassword("admin");
        return u.save();
    }
    else {
        console.log("Admin user already exists");
    }
}).then(() => {
    let server = http.createServer(app);
    ios = io(server);
    ios.on('connection', function (client) {
        console.log("Socket.io client connected".green);
    });
    server.listen(8080, () => console.log("HTTP Server started on port 8080".green));
}).catch((err) => {
    console.log("Error Occurred during initialization".red);
    console.log(err);
});
//# sourceMappingURL=REST_API.js.map