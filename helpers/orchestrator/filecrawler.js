"use strict";
let request = require("request-promise");

module.exports = function(couch){
    //get data
    let getData = function(files){
        return new Promise(function(resolve, reject){
            if(files.length > 0){
                let setup = {
                    uri: "https://dev-filescavenger-mk2.mybluemix.net/file/data",
                    method: "post",
                    json: true,
                    body: files
                };
                request(setup).then(function(response){
                    resolve(response.data);
                }).catch(function(error){
                    reject(error);
                });
            }
            else{
                resolve([]);
            }
        });
    };

    //revealed module
    return getData;
};