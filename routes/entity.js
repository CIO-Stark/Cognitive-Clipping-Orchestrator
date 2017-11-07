"use strict";
module.exports = function(app, modules){
    let entity = require("../helpers/entity")(modules.couch);
    //load all entities
    app.get("/entity/load", function(req, res){
        entity.load()
        .then(function(data){
            res.send({
                status: true,
                data: data
            });
        })
        .catch(function(error){
            res.send({
                status: false,
                error: error,
                message: "entity:load -> error"
            });
        });
    });

    //retrieve entity by id
    app.get("/entity/:id", function(req, res){
        let id = req.params.id || false;
        if(id){
            entity.get(id)
            .then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            })
            .catch(function(error){
                res.send({
                    status: false,
                    error: error,
                    message: "entity:get -> error"
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "entity:get -> invalid id"
            });
        }
    });

    //create entity
    app.post("/entity/create", function(req, res){
        let entityName = req.body.entity || false;
        if(entityName){
            entity.create({
                entity: entityName
            })
            .then(function(data){
                let response = {
                    status: true,
                    data: data
                };
                modules.socket.sockets.emit("entity-created", response);
                res.send(response);
            })
            .catch(function(error){
                res.send({
                    status: false,
                    error: error,
                    message: "entity:create -> error"
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "entity:create -> invalid data"
            });
        }
    });

    //update entity
    app.post("/entity/update", function(req, res){
        let entityName = req.body.entity || false;
        let context = req.body.context || false;
        let id = req.body._id;
        let rev = req.body._rev;
        if(entityName && context && id && rev){
            entity.update({
                entity: entityName,
                context: context,
                _id: id,
                _rev: rev
            }, id)
            .then(function(data){
                let response = {
                    status: true,
                    data: data
                };
                modules.socket.sockets.emit("entity-updated", response);
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
                message: "entity:update -> invalid data"
            });
        };
    });

    //delete entity
    app.post("/entity/delete", function(req, res){
        let id = req.body._id || false;
        let rev = req.body._rev || false;
        if(id && rev){
            entity.remove(id, rev)
            .then(function(data){
                let response = {
                    status: true,
                    data: data
                };
                modules.socket.sockets.emit("entity-deleted", response);
                res.send(response);
            })
            .catch(function(error){
                res.send({
                    status: false,
                    error: error,
                    message: "entity:delete -> error"
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "entity:delete -> invalid entity"
            });
        }
    });
};