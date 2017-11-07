(function () {
	"use strict";
	//var orchestrator = require("../setups/orchestrator");

	/**
	 * types for correlation
	 */
	var CORRELATION_TYPE = {
		ENTITY_KEYWORD: 1,
		ENTITY_CRAWLED_DATA: 2
	};

	/**
	 * enum for the correlation factory
	 */
	var CORRELATION_GRAPHIC = {
		VISJS: 1,
		SIGMAJS: 2
	};


	/**
	 * Prepare the base for the correlation graphic. At the end it must be sent to the right factory for the final parse
	 * 
	 * @param {*} entity
	 * @param {*} data must be the following format: 
	 * [{   "entity": "ibm",
                		"data": [ {"docs.."} ]
		}, {"entity" : "apple" ...}
	]
	 * @param {*} type 
	 */
	let createCorrelation = function (data, limit) {
		return new Promise((resolve, reject) => {
			
			let finalResolve = {
				nodes: [],
				keywords: [],
				entityRelations: []
			};

			let correlationData = createNodes(data, limit);
			finalResolve.nodes = correlationData.nodes;
			finalResolve.keywords = correlationData.keywords;
			finalResolve.entityRelations = correlationData.entityRelations;


			resolve(finalResolve);
		});
	};


	function createNodes(data, limit) {
		let nodes = [];
		let keywords = {};
		let entityRelations = {};
		let edges = [];

		data.forEach(entity => {
			// main entity nodes
			nodes.push({
				id: entity.entity,
				label: entity.entity,
				level: 0
			});


			entity.data.forEach((entry, index) => {
				//if (limit && (index >= limit)) return;
				// First, will create the level 1 node (ex: tweet, face, webpage, etc)
				let n = {
					id: entry._id,
					label: entry.source,
					group: entry.source,
					level: 1,
					refersToEntity: entity.entity,
					sentiment: entry.sentiment,
					internalRelations: {}
				};
				nodes.push(n);

				// iterate for the NLU entity types or "relations" (person, organization, etc) 
				if (entry.hasOwnProperty("relations") && entry.relations !== null && entry.relations.length)
					entry.relations.forEach(relation => {
						if (relation.hasOwnProperty("arguments"))
							relation.arguments.forEach(arg => {
								let id = entry._id + "_" + relation.type + "_" + arg.entities[0].type + "_" + arg.entities[0].text; 
								/* nodes.push({
									id: id,
									label: arg.entities[0].text,
									refersToEntity: entry._id,
									group: "relations",
									level: 2,
									type: relation.type,
									relevance: relation.score
								}); */

								id = relation.type + "_" + arg.entities[0].type + "_" + arg.entities[0].text;
								if (!entityRelations[id])
									entityRelations[id] = {
										"geralScore": relation.score,
										"refersToEntity": entity.entity,
										"count": 1,
										"type" : arg.entities[0].type.toLowerCase(),
										"originSource": [{ id: entry._id, score: relation.score, text: arg.entities[0].text }],
									};
								else {
									// if relation exists, sum the count and build the score average
									entityRelations[id].count++;
									entityRelations[id].geralScore += relation.score;

									entityRelations[id].originSource.push({ id: entry._id, score: relation.score, text: arg.entities[0].text });

								}

							});

					});

				if (entry.hasOwnProperty("keywords") && !(typeof (entry.keywords) === "boolean"))
					entry.keywords.forEach(key => {

						/* nodes.push({
							id: entry._id + "_" + key.text,
							label: key.text,
							refersToEntity: entry._id,
							group: "keywords",
							level: 2,
							relevance: key.relevance
						}); */

						if (!keywords[key.text])
							keywords[key.text] = {
								"geralRelevance": key.relevance,
								"refersToEntity": entity.entity,
								"count": 1,
								"originSource": [{ id: entry._id, relevance: key.relevance }],
							};
						else {
							// if keyword exists, sum the count and build the relevance average
							keywords[key.text].count++;
							keywords[key.text].geralRelevance += key.relevance;

							// adding all the sources that has the keyword, that way we can show the correlation later
							keywords[key.text].originSource.push({ id: entry._id, relevance: key.relevance });

						}
					});


			});

			
		});
		return {
			nodes: nodes,
			keywords: keywords,
			entityRelations : entityRelations
		};

	}



	/**
	 * create correlation factory for the different graphic front end libraries that could
	 * receive the data at the end
	 * @param {*} type 
	 */
	function correlationFactory(type) {
		if (type === CORRELATION_GRAPHIC.VISJS)
			return require("./correlation/vis-js")(this);
		else if (type === CORRELATION_GRAPHIC.SIGMAJS)
			return require("./correlation/sigma-js")(this);
		else return undefined;

	}
		

	module.exports = {
		correlationFactory : correlationFactory,
		createCorrelation: createCorrelation,
		CORRELATION_TYPE_ENUM: CORRELATION_TYPE,
		CORRELATION_GRAPHIC_ENUM : CORRELATION_GRAPHIC
	};


}());