"use strict";
let moment = require("moment");
let config = {};

//filter by entity
let filterByEntity = function(data, entity){
    let result = [];
    let regex = new RegExp(entity, "gi");
    data.forEach(function(entry){
        if(entry.text.match(regex)){
            result.push(entry);
        }
    });
    return result;
};

let normalize = function(data){
    let max = 15;
    let sourceCount = {};
    // get quantity of each source
    data.forEach(function(entry){
        if(sourceCount[entry.source])
            sourceCount[entry.source].total++;
        else sourceCount[entry.source] = {total:1, removed: 0};   
    });

    let minimal = 0;
    for(let key in sourceCount)
        if(sourceCount[key] > minimal) minimal = sourceCount[key];

    console.log(sourceCount);

    let index = -1;
    for(var key in sourceCount)
        while(sourceCount[key].total > max){
            if(data.find((entry, idx) =>{
                index = idx;
                return entry.source === key;
            })){
                data.splice(index, 1);
                sourceCount[key].total--;
            }
        }

    if(sourceCount[key] > minimal) minimal = sourceCount[key];
    
    
    let sourceCount2 = {};
    // get quantity of each source
    data.forEach(function(entry){
        if(sourceCount2[entry.source])
            sourceCount2[entry.source].total++;
        else sourceCount2[entry.source] = {total:1, removed: 0};   
    });

    
    console.log(sourceCount2);
    return data;
};

//filter by source
let filterBySource = function(data, sources){
    if(sources){
        let result = [];
        data.forEach(function(entry){
            if(sources.hasOwnProperty(entry.source) && sources[entry.source] == true){
                result.push(entry);
            }
        });
        return result;
    }
    return data;
};

//filter by profile
let filterByProfile = function(data, profiles){
    if(profiles){
        let result = [];
        data.forEach(function(entry){
            if(entry.hasOwnProperty("profile")){
                if(profiles.hasOwnProperty(entry.profile) && profiles[entry.profile] === true){
                    result.push(entry);    
                }
            }
            else{
                result.push(entry);
            }
        });
        return result;
    }
    return data;
};

//filter by sentiment
let filterBySentiment = function(data, sentiments){
    if(sentiments){
        let result = [];
        data.forEach(function(entry){
            if(sentiments.hasOwnProperty(entry.sentiment.label) && sentiments[entry.sentiment.label] === true){
                result.push(entry);
            }
        });
        return result;
    }
    return data;
};

//filter by contexts
let filterByContext = function(data, contexts){
    if(contexts){
        let regex = new RegExp(contexts.join("|"), "gi");
        let result = [];
        data.forEach(function(entry){
            entry.categories.forEach(function(category){
                if(category.score >= config.categoryRelevance && category.label.match(regex)){
                    result.push(entry);
                }
            });
        });
        return result;
    }
    return data;
};

//filter by date
let filterByDate = function(data, start, end){
    let checkRange = function(date){
        date = moment(date, "YYYY-MM-DD");
        return date.isBetween(start, end);
    };
    start = start || moment("0001-01-01", "YYYY-MM-DD");
    if(start && end){
        start = moment(start, "YYYY-MM-DD");
        end = moment(end, "YYYY-MM-DD");
        let result = [];
        data.forEach(function(entry){
            if(entry.hasOwnProperty("date")){
                if(checkRange(entry.date)){
                    result.push(entry);
                }
            }
            else{
                result.push(entry);
            }
        });
        return result;
    }
    return data;
};

//filter keywords
let filterKeywords = function(data, min){
    min = min || config.keywordRelevance;
    data.forEach(function(entry){
        if(entry.hasOwnProperty("keywords")){
            let filtered = [];
            entry.keywords.forEach(function(keyword){
                if(keyword.relevance > min){
                    filtered.push(keyword);
                }
            });
            entry.keywords = filtered;   
        }
    });
    return data;
};

//exclude content
let excludeContent = function(data, strings){
    if(strings && strings.length > 0){
        let result = [];
        let exp = "( "+ strings.join(" | ") +" )";
        let regex = new RegExp(exp, "gi");
        data.forEach(function(entry){
            if(!entry.text.match(regex)){
                result.push(entry);
            }
        });
        return result;
    }
    return data;
};

//order data by dates
let orderByDate = function(data, asc){
    data.sort(function(a,b){
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    if(!asc){
        data.reverse();
    }
    return data;
};

//cap results
let capResults = function(data){
    data = data.slice(0, 10);
    data.forEach(function(entry){
        entry.keywords = entry.keywords? entry.keywords.slice(0, 4): null;
        entry.entities = entry.entities? entry.entities.slice(0, 4) : null;
        entry.relations = entry.relations? entry.relations.slice(0, 4) : null;
    });
};

//revealed module
module.exports = function(setup){
    config = setup;
    return {
        byEntity: filterByEntity,
        normalize: normalize,
        bySource: filterBySource,
        byProfile: filterByProfile,
        bySentiment: filterBySentiment,
        byContext: filterByContext,
        byDate: filterByDate,
        filterKeywords: filterKeywords,
        excludeContent: excludeContent,
        orderByDate: orderByDate,
        capResults: capResults
    };
};