"use strict";
module.exports = function(app, modules){
    let auth = require("../helpers/auth")(modules.couch);
    let secret = app.get("JWTSecret");

    //check token
    app.get("/auth/check/:token", function(req, res){
        let token = req.body.token || req.params.token || req.query.token || req.headers['x-access-token'];
        if(token){
            modules.jwt.verify(token, secret.key, function(error, tokenData){//ckech token
                if(error){
                    res.send({
                        status: false,
                        message: "auth:check -> invalid token"
                    });
                }
                else{
                    res.send({
                        status: true
                    });
                }
            });
        }
        else{
            res.send({
                status: false,
                message: "auth:check -> invalid request"
            });
        }
    });

    //login
    app.post("/auth/login", function(req, res){
        let username = req.body.username || false;
        let password = req.body.password || false;
        if(username && password){
            auth.login(username, password)
            .then(function(data){
                let token = modules.jwt.sign({//create token
                    data: data,
                }, secret.key, {
                    expiresIn: secret.expire
                });
                let response = {//build response
                    status: true,
                    token: token,
                    user: {
                        email: data.email,
                        profile: data.profile
                    }
                };
                modules.socket.sockets.emit("user-login", response);//emit response on socket
                res.send(response);
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message,
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "auth:login -> invalid request"
            });
        }
    });

    //logout
    app.post("/auth/logout", function(req, res){
        let token = req.body.token || req.params.token || req.query.token || req.headers['x-access-token'];
        let username = req.body.username || false;
        if(token && username){
            modules.jwt.verify(token, secret.key, function(error, tokenData){//ckech token
                if(error){
                    res.send({
                        status: false,
                        message: "auth:logout -> invalid token"
                    });
                }
                else{
                    auth.logout(username)
                    .then(function(data){
                        let response = {
                            status: true,
                            username: username
                        };
                        modules.socket.sockets.emit("user-logout", response);
                        res.send(response);
                    })
                    .catch(function(error){
                        res.send({
                            status: false,
                            message: error.message
                        });
                    });
                }
            });
        }
        else{
            res.send({
                status: false,
                message: "auth:logout -> invalid request"
            });
        }
    });
};