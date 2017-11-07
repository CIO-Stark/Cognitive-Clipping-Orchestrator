(function () {
	"use strict";

	module.exports = function (correlation) {

		let iconTypes = {
			facebook: 'facebook',
			twitter: 'twitter',
			file: 'file',
			nodecrawler: 'nodecrawler',
			company: 'company',
			organization: 'organization',
			person: 'person',
			entity: 'entity',
			keyword: 'keyword'
		}

		// for testing purpose only
		/* let iconTypes = {
				facebook: 'network/facebook.svg',
				twitter: 'network/twitter.svg',
				file: 'fileIcon',
				nodecrawler: 'network/news.svg',
				company: 'companyIcon',
				organization: 'network/organization.svg',
				person: 'network/person.svg',
				entity: 'network/entity_target.svg',
				keyword: 'network/keyword.svg'
		} */

		function getType(value) {
			return iconTypes[value] || 'noicon';
		}


		return {
			/**
			 * output valid format is:
			 * "data": {
			"edges": [
			{ "id": "xxx",
			"source": "ibm",
			"target": "keywords_nomes ibm watson"
					}
					],
			"nodes": [
					{
							"id": "ibm",
							"label": "ibm",
							"size": 100,
							type:,
							url:
					}
					]
			}
	
			Remembering that the main (entity) and article nodes are already present from Parent data
	
			 */
			parse: (data, type) => {
				let nodes = [];
				let edges = [];
				let e = 0;
				let y = 0;

				if (type === correlation.CORRELATION_TYPE_ENUM.ENTITY_CRAWLED_DATA) {

					data.nodes.forEach(node => {
						if (node.level == 0) {
							node.x = 0;
							node.y = y++;
							node.size = 4;
							node.type = 'image',
								node.url = getType('entity')
						}


						// first level -> main entity with articles
						if (node.level == 1) {
							node.x = Math.random();
							node.y = Math.random();
							node.size = 3;
							node.type = 'image';
							node.url = getType(node.group);
							edges.push({
								id: "edge-" + e++,
								source: node.refersToEntity,
								target: node.id,
								type: "entity",
								color: node.sentiment.label === 'negative' ? '#DC267F' : node.sentiment.label === 'positive' ? '#00BAA1' : '#D0DADA'
							});

						}
					});

					// create link between articles and the relations
					Object.keys(data.entityRelations).forEach(key => {
						nodes.push({
							id: key,
							label: data.entityRelations[key].originSource[0].text,
							group: "relations",
							level: 2,
							x: Math.random(),
							y: Math.random(),
							size: 3,
							type: 'image',
							url: getType(data.entityRelations[key].type)
						});


						data.entityRelations[key].originSource.forEach(originSource => {
							edges.push({
								id: "edge-" + e++,
								source: originSource.id,
								target: key,
								type: "relations"
							});

						});
					});

					// creating keyword nodes
					Object.keys(data.keywords).forEach(key => {
						nodes.push({
							id: key,
							label: key,
							group: "keywords",
							level: 2,
							x: Math.random(),
							y: Math.random(),
							size: 3,
							type: 'image',
							url: getType('keyword')
						});

						// create the keyword edges
						data.keywords[key].originSource.forEach(originSource => {
							edges.push({
								id: "edge-" + e++,
								source: originSource.id,
								target: key,
								type: "keyword"
							});
						});

					});

					data.nodes = data.nodes.concat(nodes);


					return {
						edges: edges,
						nodes: data.nodes

					};
				}
			}

		}
	}


}());
