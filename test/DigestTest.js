/**
 * Testes para funcoes dos filtros do orchestrator

 */

require('dotenv').config()
var assert = require('assert');
var should = require('should');

var filter = require('../helpers/orchestrator/filter')();

describe('Digest basic', function () {
	this.timeout(15000);

	it('it should return valid digest', (done) => {
		var digest = require('../helpers/orchestrator/digest')({
			"keywordRelevance": 0.5,
			"categoryRelevance": 0.5,
			"validLanguages": ["de", "fr", "ja", "es", "pt", "en"]
		});
		
		digest("teste de funcionalidade de tradução do watson")
					.then(function (dataResp) {
						assert.equal(dataResp.language, "pt");
						assert.equal(dataResp.hasOwnProperty("translations"), true);
						assert.equal(dataResp.hasOwnProperty("sentiment"), true);
						assert.equal(dataResp.hasOwnProperty("entities"), true);
						assert.equal(dataResp.hasOwnProperty("categories"), true);
						assert.equal(dataResp.hasOwnProperty("keywords"), true);
						assert.equal(dataResp.hasOwnProperty("relations"), true);
						assert.equal(dataResp.hasOwnProperty("concepts"), true);
						console.log(JSON.stringify(dataResp, null, 3));
						done();

                }).catch(function (error) {
					console.log("promisse error", error);
					done();
					
                });
			
		
		
		
		
		//done();

	});

	
	
});