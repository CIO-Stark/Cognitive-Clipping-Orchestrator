"use strict";
module.exports = function(couch){
    //set collection
    let db = false;
    couch.instance.db.create("clipping-presentation-entity", function(error, response){
        db = couch.interface("clipping-presentation-entity");
    });

    //load all entities
    let load = function(selectors){
        return new Promise(function(resolve, reject){
            db.find(selectors).then(function(data){
                let result = [];
                data.rows.forEach(function(entry){
                    result.push(entry.doc);
                });
                resolve(result);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //get entity
    let get = function(id){
        return new Promise(function(resolve, reject){
            db.get(id).then(function(doc){
               resolve(doc);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //create entity
    let create = function(data){
        return new Promise(function(resolve, reject){
            db.set(data).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //update entity
    let update = function(data, id){
        return new Promise(function(resolve, reject){
            db.update(data, id).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //delete entity
    let remove = function(id, rev){
        return new Promise(function(resolve, reject){
            db.remove(id, rev).then(function(status){
                resolve(status);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //revealed module
    return {
        load: load,
        get: get,
        create: create,
        update: update,
        remove: remove
    };
};