"use strict";
let request = require("request-promise");
const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

module.exports = function(){

    var SECURE_GATEWAY_ENPOINT = "http://cap-sg-prd-4.integration.ibmcloud.com:18502";
    var FORUM_SEARCH_ENDPOINT = "https://w3-connections.ibm.com/search/atom/search?scope=forums&query=";
    var BLOG_SEARCH_ENDPOINT = "https://w3-connections.ibm.com/search/atom/search?scope=blogs&query=";

    /**
     * performs basic GET search
     * @param {*} url 
     */
    let getJSON_Atom = function(url){
        return new Promise(function(resolve, reject){
            // user-agent is mandatory for connections api
            let options = {
                uri: url,
                method: "GET",
                headers: {
                    "Content-Type": "application/atom+xml;charset=UTF-8",
                    "Accept": "application/atom+xml",
                    "Authorization": "Basic c3Rhcmsuc3F1YWRAYnIuaWJtLmNvbToySUJNdzNpZA==",
                    "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
                },
            };
            console.log("querying " + url);
            request(options).then(response => {
                /**
                 * parse connections xml to json and return the feed only
                 */
                let parseString = require('xml2js').parseString;
                parseString(response, function (err, result) {
                    if(err) reject('cannot parse xml response', err);
                    resolve(result);
                });
            }).catch(function(error){
                console.error(error);
                reject(error);
            });
        });
    }

    /**
     * find a connections forum or blog entry based on its filter
     * @param {*} filters 
     */
    let findEntryByString = function(filters){
        return new Promise(function(resolve, reject){
            // get main feed, the one that contains links for the searched data
            let url;
            if(!filters.scope){
                reject("scope is mandatory. Ex: forums");
                return;
            }
            if(filters.scope === 'forums')
                url = FORUM_SEARCH_ENDPOINT;
            else if(filters.scope === 'blogs')
                url = BLOG_SEARCH_ENDPOINT;
            else reject("invalid scope. Valid ones: forums, blogs");

            getJSON_Atom(url + filters.entity + "&pageSize=" + filters.limit).then(data =>{
                if(filters.debug){
                    resolve(data);
                    return;
                }
                let dataPromises = [];
                /**
                 * get all the feed/entry urls since the search will return the urls and not the atom content
                 */
                if(data.hasOwnProperty("feed")){
                    data.feed.entry.forEach(entry=> {
                        if(entry.link)
                            entry.link.forEach(link => {
                                // get only the TOPIC urls (api will return forum and topics)
                                if(link["$"].hasOwnProperty("rel") && link["$"].rel === 'via')
                                    if(link["$"].href.indexOf("/forums/atom/topic") != -1 || 
                                        link["$"].href.indexOf("/blogs/") != -1)
                                        dataPromises.push(getJSON_Atom(link["$"].href));
                            });
                        
                    });
                }

                Promise.all(dataPromises).then(allData => {
                    let result = [];
                    allData.forEach(entry => {
                        if(filters.scope === 'forums')
                            result.push(forumEntryParse(entry));
                        else if(filters.scope === 'blogs')
                            result.push(blogEntryParse(entry)); 
                    });
                    
                    resolve(result);

                }).catch(error => {
                    console.error(error);
                    reject("error while retrieving feeds", error);
                });


            }).catch(error => {
                console.error(error);
                reject("error while retrieving main endpoint", error);
            });

        });
        
    };  

    function forumEntryParse(entry){
        return {
            title: entry.entry.title.length ? entry.entry.title[0]["_"] : "",
            published: (entry.entry.published.length) ? entry.entry.published[0] : "",
            content: (entry.entry.content.length) ? 
                entities.decode(entry.entry.content[0]["_"]).replace(new RegExp("(<[^>]*>)|(\\.)", "gi"), "")
                                           .replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "") : ""  //clean up html tags
        }
    }

    function blogEntryParse(entry){
        return {
            title: entry.entry.title.length ? entry.entry.title[0]["_"] : "",
            published: (entry.entry.published.length) ? entry.entry.published[0] : "",
            content: (entry.entry.content.length) ? 
                entities.decode(entry.entry.content[0]["_"]).replace(new RegExp("(<[^>]*>)|(\\.)", "gi"), "")
                                           .replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "") : ""  //clean up html tags
        }
    }
               

    //revealed module
    return {
        findEntryByString : findEntryByString
    }
};