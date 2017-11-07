"use strict";
let sources = require("./orchestrator/sources");
let filter = require("./orchestrator/filter");
let digest = require("./orchestrator/digest");
let filecrawler = require("./orchestrator/filecrawler");
let correlation = require("./orchestrator/correlation");
let db = false;

module.exports = function(config, couch){
    //startup routine
    sources = sources(couch);//load data sources interface
    filter = filter(config);//load data filters
    digest = digest(config);//load data processor
    filecrawler = filecrawler(couch);
    couch.instance.db.create("clipping-presentation-data", function(error, response){//create database
        db = couch.interface("clipping-presentation-data");//set collection handler
    });

    //return data from sources for given filters
    let sourcesData = function(filters){
        let entityData = function(entity){
            return new Promise(function(resolve, reject){
                let sourcesPromises = [];
                sourcesPromises.push(sources.twitter(entity));
                sourcesPromises.push(sources.facebook(entity));
                sourcesPromises.push(sources.nodecrawler(entity));
                Promise.all(sourcesPromises).then(function(response){
                    //join results
                    let data = [];
                    response.forEach(function(source){
                        data = data.concat(source);
                    });
                    //filter results
                    //data = filter.byEntity(data, entity);
                    //data = filter.bySource(data, filters.sources);
                    //data = filter.byProfile(data, filters.profiles);
                    data = filter.byDate(data, filters.start, filters.end);
                    data = filter.excludeContent(data, filters.exclude);
                    resolve(data);
                }).catch(function(error){
                    reject(error);
                })
            });
        };
        return new Promise(function(resolve, reject){
            let entityPromises = [];
            filters.entity.forEach(function(entity){
                entityPromises.push(entityData(entity));
            });
            Promise.all(entityPromises).then(function(response){
                let data = [];
                response.forEach(function(entityData){
                    data = data.concat(entityData);
                });
                resolve(data);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //process data, persist and return analysis 
    let digestData = function(data){
        let digestEntries = function(entries){
            if(entries.length > 0){
                let entry = entries.pop();
                return new Promise(function(resolve, reject){
                    digest(entry.text).then(function(result){
                        if(result !== false){
                            for(let prop in result){
                                entry[prop] = result[prop];
                            }
                            db.set(entry).then(function(response){
                                processed++;
                                console.log("digest sucess", entries.length);
                                resolve(digestEntries(entries));
                            }).catch(function(error){
                                console.log("digest error", entries.length);
                                resolve(digestEntries(entries));
                            });
                        }
                        else{
                            resolve(digestEntries(entries));
                        }
                    });
                });
            }
            else{
                resolve(processed);
            }
        }
        //start
        let processed = 0;
        return digestEntries(data);
    };

    //process sources data
    let processData = function(filters, callback){
        sourcesData(filters).then(function(response){
            callback(null, response);
            digestData(response).then(function(processed){
                console.log("processed data", processed, response.length);
            }).catch(function(error){
                console.log("process data error", error);
            });
        }).catch(function(error){
            callback(error, null);
        });
    };

    //return processed entries
    let processedData = function(entity){
        return new Promise(function(resolve, reject){
            couch.luceneGet({
                collection: 'clipping-presentation-data',
                viewName: 'by_profileAndText',
                query: 'text:'+entity + ' AND(profile:uol OR source:facebook)',
                limit: 200,
                designName: 'searchPresentation'
            })
            .then(function(response){
                let data = [];
                response.rows.forEach(function(entry){
                    data.push(entry.doc);
                });
                resolve(data);
            }).catch(function(error){
                reject(error);
            })
        });
    };

    //return contexts for given entities
    let getContexts = function(entities){
        let getCategories = function(data){
            let result = [];
            data.forEach(function(entry){
                entry.categories.forEach(function(category){
                    if(category.score >= config.categoryRelevance && result.indexOf(category.label) === -1){
                        result.push(category.label);
                    }
                });
            });
            return result;
        };
        let contextData = function(entity){
            return new Promise(function(resolve, reject){
                processedData().then(function(data){
                    data = filter.byEntity(data, entity);
                    resolve({
                        entity: entity,
                        data: getCategories(data)
                    });
                }).catch(function(error){
                    reject(error);
                })
            });    
        };
        let getCommon = function(contextsData){
            let data = [];
            contextsData.forEach(function(contextData){
                data.push(contextData.data);
            });
            let total = [];
            let common = [];
            total = total.concat(data);
            common = total.shift().filter(function(v) {
                return total.every(function(a) {
                    return a.indexOf(v) !== -1;
                });
            });
            return common;
        };
        return new Promise(function(resolve, reject){
            let contextPromises = [];
            entities.forEach(function(entity){
                contextPromises.push(contextData(entity));
            });
            Promise.all(contextPromises).then(function(response){
                let result = [];
                if(response.length > 1){
                    result.push({
                        label: "Em Comun",
                        data: getCommon(response)
                    });
                }
                response.forEach(function(contextData){
                    result.push({
                        label: contextData.entity,
                        data: contextData.data
                    });
                });
                resolve(result);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //return data from clipping data
    let getProcessedData = function(filters){
        let entityData = function(entity){
            return new Promise(function(resolve, reject){
                processedData(entity).then(function(data){
                    //filter results
                    //data = filter.byEntity(data, entity);
                    //data = filter.normalize(data); // keep same amount of data for each source
                    //data = filter.bySource(data, filters.sources);
                    //data = filter.byProfile(data, filters.profiles);
                    data = filter.bySentiment(data, filters.sentiments);
                    data = filter.byContext(data, filters.contexts);
                    data = filter.byDate(data, filters.start, filters.end);
                    data = filter.filterKeywords(data, 0.7, config.keywordLimit);
                    data = filter.excludeContent(data, filters.exclude);
                    //data = data.slice(0,40);
                    filter.capResults(data);
                    resolve({
                        entity: entity,
                        data: data
                    });
                }).catch(function(error){
                    reject(error);
                });
            });
        };
        return new Promise(function(resolve, reject){
            let promises = [];
            filters.entity.forEach(function(entity){
                promises.push(entityData(entity));
            });
            Promise.all(promises).then(function(response){
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //return correlation data for given filters
    let getCorrelationData = function(filters){
        return new Promise(function(resolve, reject){
            getProcessedData(filters).then(function(data){
                correlation.createCorrelation(data).then(function(dataResp){
                    let correlationImplement = correlation.correlationFactory(correlation.CORRELATION_GRAPHIC_ENUM.SIGMAJS);            
                    resolve(correlationImplement.parse(dataResp, correlation.CORRELATION_TYPE_ENUM.ENTITY_CRAWLED_DATA), null, 3);
                }).catch(function(error){
                    reject(error);
                });    
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //revealed module
    return {
        filecrawler: filecrawler,
        filter: filter,
        getContexts: getContexts,
        processData: processData,
        getProcessedData: getProcessedData,
        getCorrelationData: getCorrelationData
    };
};