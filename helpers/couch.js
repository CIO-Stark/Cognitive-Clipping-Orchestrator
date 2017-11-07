"use strict";
let nano = require("nano");//nano:couchdb middleware
let request = require("request-promise");
const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

module.exports = function(credentials, authenticate){
    //create database instance for given credentials
    let url = "http://"+ credentials.username +":"+ credentials.password +"@"+ credentials.url;
    let instance = nano(url);
    if(authenticate)
        instance.auth(credentials.username, credentials.password, function(error, response, headers){
            if(error){
                console.log("couch auth error", error);
            }
            else{
                instance = nano({
                    url: url,
                    cookie: headers["set-cookie"]
                });
                console.log("couch instance loaded");
            }
        });

    //get collection
    let getCollection = function(collectionName){
        return instance.db.use(collectionName);
    };

    //create collection interface methods
    let createInterface = function(collection){
        //find documents
        let find = function(selectors){
            let query = selectors || {};
            query.include_docs = (selectors && selectors.hasOwnProperty("include_docs")) ? selectors.include_docs : true;
            return new Promise(function(resolve, reject) {
                collection.list(query, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //get document
        let get = function(id, options){
            return new Promise(function(resolve, reject){
                collection.get(id, options || {}, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //insert document
        let set = function(data, options){
            return new Promise(function(resolve, reject){
                collection.insert(data, options, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //update document
        let update = function(data, id){
            return new Promise(function(resolve, reject){
                collection.get(id, function(error, existing){ 
                    if(error){
                        reject(error);
                    }
                    data._rev = existing._rev;
                    collection.insert(data, id, function(error, response){
                        if(error){
                            reject(error);
                        }
                        resolve(response);
                    });
                });
            });
        };

        //delete document
        let remove = function(id, rev){
            return new Promise(function(resolve, reject){
                collection.destroy(id, rev, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        //fetch
        let fetch = function(ids){
            return new Promise(function(resolve, reject) {
                collection.fetch(ids, function(error, data){
                    if(error){
                        reject(error);
                    }
                    resolve(data);

                });
            });
        };

        //bulk insert
        let bulk = function(data){
            let payload = {
                docs: data
            };
            return new Promise(function(resolve, reject){
                collection.bulk(payload, function(error, response){
                    if(error){
                        reject(error);
                    }
                    resolve(response);
                });
            });
        };

        

        return {
            collection: collection,
            find: find,
            get: get,
            set: set,
            update: update,
            remove: remove,
            fetch: fetch,
            bulk: bulk
        };
    };

    //load collections
    let luceneGet = function(selector){
        let url = 'http://' + credentials.url + '/_fti/local/' + selector.collection 
            + '/_design/' + selector.designName + '/' + selector.viewName + '?q=' + selector.query + '&include_docs=true&limit=' + (selector.limit || 5);
        //url = entities.encodeNonUTF(url);
        console.log("querying for", url);
        var options = {
            uri: url,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json"
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

    //revealed module
    return {
        instance: instance,
        interface: function(collectionName){
            return createInterface(getCollection(collectionName));
        },
        luceneGet: luceneGet
    };
};