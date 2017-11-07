"use strict";
module.exports = function(app, modules){
    let orchestrator = require("../helpers/orchestrator")(modules.config, modules.couch);
    //return process data for given filters
    app.post("/orchestrator/process", function(req, res){
        let entity = req.body.entity || false;
        let sources = req.body.sources || false;
        let profiles = req.body.profiles || false;
        let exclude = req.body.exclude || false;
        let start = req.body.start || false;
        let end = req.body.end || false;
        if(entity){
            orchestrator.processData({
                entity: entity,
                sources: sources,
                profiles: profiles,
                start: start,
                end: end,
                exclude: exclude
            }, function(error, data){
                if(error){
                    res.send({
                        status: false,
                        message: error.message
                    });
                }
                else{
                    res.send({
                        status: true,
                        data: data.length
                    });
                }
            });
        }
        else{
            res.send({
                status: false,
                message: "orchestrator:data -> invalid request"
            });
        }
    });

    //return contexts for given entities
    app.post("/orchestrator/contexts", function(req, res){
        let contexts = req.body || false;
        if(contexts){
            orchestrator.getContexts(contexts)
            .then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "orchestrator:contexts -> invalid request"
            });
        }
    });

    //return data for given filters
    app.post("/orchestrator/data", function(req, res){
        let entity = req.body.entity || false;
        let sources = req.body.sources || false;
        let profiles = req.body.profiles || false;
        let files = req.body.files || false;
        let exclude = req.body.exclude || false;
        let sentiments = req.body.sentiments || false;
        let context = req.body.context || false;
        let start = req.body.start || false;
        let end = req.body.end || false;
        let asc = req.body.asc || false;
        if(entity){
            orchestrator.getProcessedData({
                entity: entity,
                sources: sources,
                profiles: profiles,
                exclude: exclude,
                sentiments: sentiments,
                context: context,
                start: start,
                end: end
            })
            .then(function(data){
                let result = [];
                orchestrator.filecrawler(files).then(function(files_response){
                    result = result.concat(files_response);
                    data.forEach(function(source){
                        result = result.concat(source.data);
                    });
                    data = orchestrator.filter.orderByDate(data, asc);
                    res.send({
                        status: true,
                        dataLength: result.length,
                        data: result
                    });
                }).catch(function(error){
                    res.send({
                        status: false,
                        message: error.message
                    });
                });
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "orchestrator:data -> invalid request"
            });
        }
    });

    //return correlation data for given filters
    app.post("/orchestrator/correlation", function(req, res){
        let entity = req.body.entity || false;
        let sources = req.body.sources || false;
        let profiles = req.body.profiles || false;
        let exclude = req.body.exclude || false;
        let sentiments = req.body.sentiments || false;
        let context = req.body.context || false;
        let start = req.body.start || false;
        let end = req.body.end || false;
        let asc = req.body.asc || false;
        let limit = req.body.limit || false;
        if(entity){
            orchestrator.getCorrelationData({
                entity: entity,
                sources: sources,
                profiles: profiles,
                exclude: exclude,
                sentiments: sentiments,
                context: context,
                start: start,
                end: end,
                limit: limit
            })
            .then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            })
            .catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        }
        else{
            res.send({
                status: false,
                message: "orchestrator:correlation -> invalid request"
            });
        }
    });


    /**
     * execute ibm connections multiple purpose filter
     */
    app.post("/orchestrator/connections/search", function(req, res){
        let entity = req.body.entity || false; //search string
        let start = req.body.start || false;
        let scope = req.body.scope|| false; //connections forum, blogs, wikis...
        let end = req.body.end || false;
        let asc = req.body.asc || false;
        let debug = req.body.debug || false;
        let limit = req.body.limit || 20;
        if(entity){
            orchestrator.getConnectionsData({
                entity: entity,
                scope: scope,
                start: start,
                end: end,
                debug: debug,
                limit : limit
            })
            .then(function(data){
                res.send({
                        status: true,
                        debug: debug? "debug ativo, retornando apenas a query principal" : debug,
                        data: data
                    });
                }).catch(function(error){
                    res.send({
                        status: false,
                        message: error
                    });
                });
            
            
        }
        else{
            res.send({
                status: false,
                message: "orchestrator:connections -> invalid request - search entity is mandatory"
            });
        }
    });
};