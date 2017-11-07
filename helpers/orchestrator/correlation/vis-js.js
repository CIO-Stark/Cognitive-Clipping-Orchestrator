(function () {
	"use strict";

	module.exports = function (correlation) {
		return {
			/**
			 * output valid format is:
			 * "data": {
        		"edges": [
            	{
                	"from": "ibm",
                	"to": "keywords_nomes ibm watson"
				}
				],
				"nodes": [
				{
					"id": "ibm",
					"label": "ibm",
					"group": "entity",
					"value": 100,
					"level": 0
				}
				]
			}
			 */
			parse: (data, type) => {
				let nodes = [];
				let edges = [];

				if(type === correlation.CORRELATION_TYPE_ENUM.ENTITY_CRAWLED_DATA){

					data.nodes.forEach(node =>{
						// first level -> main entity with articles
						if(node.level == 1){
							edges.push({
								from: node.refersToEntity,
								to: node.id,
								type: "entity"
							});

						}
					});

					// create link between articles and the relations
					Object.keys(data.entityRelations).forEach(key =>{
						nodes.push({
							id: key,
							label: key,
							group: "relations",
							level: 2
						});


						data.entityRelations[key].originSource.forEach(originSource =>{
							edges.push({
									from: originSource.id,
									to: key,
									type: "relations"
							});
							
						});
					});

					// creating keyword nodes
					Object.keys(data.keywords).forEach(key =>{
						nodes.push({
							id: key,
							label: key,
							group: "keywords",
							level: 2
						});

						// create the keyword edges
						data.keywords[key].originSource.forEach(originSource =>{
							edges.push({
									from: originSource.id,
									to: key,
									type: "keyword"
							});
						});
						
					});

					data.nodes = data.nodes.concat(nodes);


					return {"data": {
							edges : edges,
							nodes : data.nodes
						}
					}
				}
			}

		}
	}


}());