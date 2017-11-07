"use strict";
let nlu = require('watson-developer-cloud/natural-language-understanding/v1.js');
let default_features = {
    "sentiment": {},
    "entities": {},
    "categories": {},
    "keywords": {},
    "relations": {},
    "concepts": {},
    "emotion": {}
}

module.exports = function(credentials){
    //watson nlu instance
    let instance = new nlu({
        username: credentials.username,
        password: credentials.password,
        url: credentials.url,
        version_date: nlu.VERSION_DATE_2016_01_23
    });

    //send text to NLU
    let processText = function(text, options){
        let features = (options && options.hasOwnProperty("features")) ? options.features : default_features;
        return new Promise(function(resolve, reject){
            instance.analyze({
                "text": text,
                "features": features
            }, function(error, response){
                if(error){
                    reject(error);
                }
                resolve(response);
            });
        });
    };

    //send url to NLU
    let processUrl = function(url, options){
        let features = (options && options.hasOwnProperty("features")) ? options.features : default_features;
        let delay = (options && options.hasOwnProperty("delay")) ? options.delay : 20;
        return new Promise(function(resolve, reject){
            instance.analyze({
                "url": url,
                "features": features
            }, function(error, response){
                if(error){
                    reject(error);
                }
                resolve(response);
            });
        });
    };

    //revealed module
    return {
        text: processText,
        url: processUrl
    };
};