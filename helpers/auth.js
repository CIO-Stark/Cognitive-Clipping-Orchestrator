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

    //login user
    let login = function(username, password){
        return new Promise(function(resolve, reject){
            load().then(function(data){
                data.forEach(function(entry){
                    if(entry.email === username && entry.password === password){
                        resolve(entry);
                    }
                });
                reject(false);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //logout user
    let logout = function(username){
        return new Promise(function(resolve, reject){
            load().then(function(data){
                data.forEach(function(entry){
                    if(entry.email === username){
                        resolve(true);
                    }
                });
                reject(false);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //revealed module
    return {
        login: login,
        logout: logout
    };
};