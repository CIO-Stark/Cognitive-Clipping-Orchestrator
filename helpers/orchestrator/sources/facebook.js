"use strict";
let moment = require("moment");
let pages = [
    "anpei.org.br",
    "abdi.digital",
    "startupsbrasileiras",
    "Exame",
    "valoreconomico",
    "InovativaBrasil",
    "agfapesp",
    "FAPEMIG",
    "fiesp",
    "SistemaFIEMGOficial",
    "MCTIC",
    "startupbr",
    "anprotec",
    "sebrae",
    "FinepInova"
];

module.exports = function(db, couch){
    //format date
    let formatDate = function(date){
        return date;
        return moment(date).format() || false;
    };

    //parse data
    let parseEntry = function(entry){
        return {
            _id: entry._id,
            source: "facebook",
            link: entry.link,
            date: formatDate(entry.date),
            author: entry.author,
            text: entry.content
        };
    };

    //get data
    let getData = function(entity){
        return new Promise(function(resolve, reject){
            couch.luceneGet({
                collection: 'facebook-data',
                viewName: 'by_content',
                query: "content:"+ entity,
                limit: 200,
                designName: 'searchByContent'
            })
            .then(function(data){
                let result = [];
                data.rows.forEach(function(entry){
                    pages.forEach(function(page){
                        if(entry.doc.page === page){
                            result.push(parseEntry(entry.doc));
                        }
                        else{
                            console.log(entry.doc.page, page);
                        }
                    });
                });
                resolve(result);
            }).catch(function(error){
                reject(error);
            });
        });
    };

    //revealed module
    return getData;
};