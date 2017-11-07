"use strict";
module.exports = function(app, modules){
    let user = require("../helpers/users")(modules.couch);
    //load all users
    app.get("/users/load", function(req, res){
        user.load()
        .then(function(data){
            res.send({
                status: true,
                data: data
            });
        })
        .catch(function(error){
            res.send({
                status: false,
                message: error.message
            });
        });
    });

    //retrieve user by id
    app.get("/users/:id", function(req, res){
        let id = req.params.id || false;
        if(id){
            user.get(id)
            .then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "users:get -> invalid request"
            });
        }
    });

    //create user
    app.post("/users/create", function(req, res){
        let email = req.body.email || false;
        let password = req.body.password || false;
        let profile = req.body.profile || "user";
        if(email && password){
            user.create({
                email: email,
                password: password,
                profile: profile
            })
            .then(function(data){
                let response = {
                    status: true,
                    data: data
                };
                modules.socket.sockets.emit("user-created", response);
                res.send(response);
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "user:create -> invalid request"
            });
        }    
    });

    //update user
    app.post("/users/update", function(req, res){
        let email = req.body.email || false;
        let password = req.body.password || false;
        let profile = req.body.profile || "user";
        let id = req.body._id;
        let rev = req.body._rev;
        if(email && password && id && rev){
            user.update({
                email: email,
                password: password,
                profile: profile,
                _id: id,
                _rev: rev
            }, id)
            .then(function(data){
                let response = {
                    status: true,
                    data: data
                };
                modules.socket.sockets.emit("user-updated", response);
                res.send(response);
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "user:update -> invalid request"
            })
        };
    });

    //delete user
    app.post("/users/delete", function(req, res){
        let id = req.body._id || false;
        let rev = req.body._rev || false;
        if(id && rev){
            user.remove(id, rev)
            .then(function(data){
                let response = {
                    status: true,
                    data: data
                };
                modules.socket.sockets.emit("user-deleted", response);
                res.send(response);
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "user:delete -> invalid request"
            });
        }
    });
};