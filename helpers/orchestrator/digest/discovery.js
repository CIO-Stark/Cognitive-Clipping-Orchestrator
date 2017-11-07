"use strict";
let request = require("request-promise");
let discovery = require("watson-developer-cloud/discovery/v1");
let baseURI = "https://gateway.watsonplatform.net/discovery/api/v1/";

module.exports = function(setup){
    //watson discovery instance
    let instance = new discovery({
        username: setup.username,
        password: setup.password,
        version_date: setup.version_date
    });

    //discovery configs
    let config = {
        version: setup.version_date,
        environment_id: setup.environment_id,
        configuration_id: setup.configuration_id,
        authorization: setup.authorization,
    };

    //load collections
    let loadCollections = function(){
        var options = {
            uri: baseURI +"environments/"+ config.environment_id +"/collections?version="+ config.version,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "authorization": config.authorization
            }
        };
        return new Promise(function(resolve, reject){
            request(options).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //get data from discovery
    let getData = function(collection_id, query){
        let setup = {
            environment_id: config.environment_id,
            collection_id: collection_id,
            query: query || ""
        };
        return new Promise(function(resolve, reject){
            instance.query(setup, function(error, response){
                if(error){
                    reject(error);
                }
                resolve(response);
            });
        });
    };

    //create collection
    let createCollection = function(name, description){
        var options = {
            uri: baseURI +"environments/"+ config.environment_id +"/collections?version="+ config.version,
            method: "POST",
            json: true,
            body: {
                "name": name,
                "description": description || "",
                "configuration_id": config.configuration_id
            },
            headers: {
                "content-type": "application/json",
                "authorization": config.authorization
            }
        };
        return new Promise(function(resolve, reject){
            request(options).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //remove collection via CURL
    let removeCollection = function(collection_id){
        var options = {
            uri: baseURI +"environments/"+ config.environment_id +"/collections/"+ collection_id +"?version="+ config.version,
            method: "DELETE",
            json: true,
            body: {},
            headers: {
                "content-type": "application/json",
                "authorization": config.authorization
            }
        };
        return new Promise(function(resolve, reject){
            request(options).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //get file details
    let getFileDetails = function(collection_id, file_id){    
        var options = {
            uri: baseURI +"environments/"+ config.environment_id +"/collections/"+ collection_id +"/documents/"+ file_id +"?version="+ config.version,
            method: "GET",
            json: true,
            body: {},
            headers: {
                "content-type": "application/json",
                "authorization": config.authorization
            }
        };
        return new Promise(function(resolve, reject){
            request(options).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //get file data
    let getFileData = function(collection_id, file_id, query){
        let counter = 0;
        let max = 20;
        let delay = 5000;
        let gather = function(collection_id, file_id, query){
            return new Promise(function(resolve, reject){
                if(counter < max){
                    counter++;
                    getData(collection_id, query).then(function(response){
                        let result = false;
                        response.results.forEach(function(file){
                            if(result === false && file.id === file_id){
                                result = file;
                            }
                        });
                        if(result !== false){
                            resolve(result);
                        }
                        else{
                            setTimeout(function(){
                                console.log("file data not found", file_id);
                                resolve(gather(collection_id, file_id, query));
                            }, delay);
                        }
                    }).catch(function(error){
                        reject(error);
                    });
                }
                else{
                    reject({
                        status: false,
                        message: "max tries reached"
                    });
                }
            });
        };
        return gather(collection_id, file_id, query);
    };

    //add file
    let addFile = function(collection_id, file){
        var setup = {
            environment_id: config.environment_id,
            collection_id: collection_id,
            file: file
        };
        return new Promise(function(resolve, reject){
            instance.addDocument(setup, function(error, data){
                console.log(data);
                if(error){
                    reject(error);
                }
                resolve(data);
            });    
        });
    };

    //remove file from collection
    let removeFile = function(collection_id, file_id){
        var setup = {
            environment_id: config.environment_id,
            collection_id: collection_id,
            document_id: file_id
        };
        return new Promise(function(resolve, reject){
            instance.deleteDocument(setup, function(error, response){
                if(error){
                    reject(error);
                }
                resolve(response);
            });
        });
    };

    //revealed module
    return {
        getData: getData,
        loadCollections: loadCollections,
        createCollection: createCollection,
        removeCollection: removeCollection,
        getFileData: getFileData,
        addFile: addFile,
        removeFile: removeFile
    };
};