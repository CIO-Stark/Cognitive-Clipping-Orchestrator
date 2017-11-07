"use strict";
let translate = require('watson-developer-cloud/language-translator/v2');

module.exports = function(credentials){
    //watson translate instance
    let instance = new translate({
        username: credentials.username,
        password: credentials.password,
        url: credentials.url
    });

    //identify language
    let identifyLanguage = function(text){
        return new Promise(function(resolve, reject){
            let params = {
                text: text
            };
            instance.identify(params, function(error, response) {
                if(error){
                    reject(error);
                }
                else{
                    resolve(response);
                }
            });
        });
    };

    //translate text
    let translateText = function(setup){
        let params = {
            source: setup.source || "pt",
            target: setup.target || "en",
            text: setup.text
        };
        return new Promise(function(resolve, reject){
            if(params.source === params.target){
                resolve(params.text);
            }
            else{
                instance.translate(params, function(error, response){
                    if(error){
                        reject(error);
                    }
                    else{
                        resolve(response);
                    }
                });
            }
        });
    };

    //revealed module
    return {
        identify: identifyLanguage,
        translate: translateText
    };
};