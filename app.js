"use strict";
//environment
require('dotenv').config({
    silent: true
});
let env = require("cfenv").getAppEnv();

//middleware setup
let config = require("./config");
let app = require("express")();
let server = require("http").createServer(app);
let socket = require("socket.io")(server);
let jwt = require("jsonwebtoken");
let couch = require("./helpers/couch")(JSON.parse(process.env.COUCHDB), true);
let compression = require("compression");
let cors = require("cors");
let bodyParser = require("body-parser");

//express setup
app.use(compression());//gzip responses
app.use(cors());//enable cross-origin requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    limit: "100mb"
}));
app.set("JWTSecret", {//used for token hash
	key: "starkSquad",
	expire: "24h"
});

//set endpoints
require("./routes")(app, {
	config: config,
	server: server,
	socket: socket,
	jwt: jwt,
    couch: couch
});

//start server
server.listen(env.port, function(){
    console.log("orchestrator running on port", env.port);
});