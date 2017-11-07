"use strict";
module.exports = function(couch){
    return {
    	twitter: require("./sources/twitter")(couch.interface("twitter-data"), couch),
    	facebook: require("./sources/facebook")(couch.interface("facebook-data"), couch),
    	nodecrawler: require("./sources/nodecrawler")(couch.interface("starkbot-data"), couch)
    };
};