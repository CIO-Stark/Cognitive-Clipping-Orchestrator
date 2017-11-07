"use strict";
module.exports = function(couch){
    //set collection
    let db = false;
    couch.instance.db.create("clipping-users", function(error, response){
        db = couch.interface("clipping-users");
    });

    //load all users
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

    //get user
    let get = function(id){
        return new Promise(function(resolve, reject){
            db.get(id).then(function(doc){
               resolve(doc);
            }).catch(function(error){
                reject(error);
            });
        });
    }; 

    //create user
    let create = function(data){
        return new Promise(function(resolve, reject){
            load().then(function(users){
            //check if a user with given email already exists   
                let exists = false;
                users.forEach(function(user){
                    if(user.email === data.email && exists === false){
                        exists = true;
                    }
                });
                if(exists){//email exists
                    reject({
                        message: "Username already exists"
                    });
                }
                else{//insert user
                    db.set(data).then(function(response){
                        resolve(response);
                    }).catch(function(error){
                        reject(error);
                    });
                }
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //update user
    let update = function(data, id){
        return new Promise(function(resolve, reject){
            db.update(data, id).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //delete user
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