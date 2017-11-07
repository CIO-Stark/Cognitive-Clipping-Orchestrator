/**
 * Testes para API de respostas
 * mocha --debug-brk
 * attach
 */

require('dotenv').config()
var assert = require('assert');
var should = require('should');

//var convFactory = require('../factory/ConversationFactory.js')();
//var convCred = require('../setup/ConversationCredentials');
var fs = require("fs");
var correlation = require('../helpers/orchestrator/correlation');
let data = JSON.parse(fs.readFileSync('./test/correlation/testMass.json'));

describe('Correlation - Basic', function () {
        

        it('it should return valid correlation data using sample of test mass', (done) => {
				correlation.createCorrelation(data, 2)
					.then(function (dataResp) {
						assert.equal(Object.keys(dataResp.keywords).length, 3);
						//assert.equal(dataResp.edges.length, 14);
						//assert.equal(dataResp.nodes.length, 16);

						//console.log(JSON.stringify(dataResp, null, 3));
						done();

                }).catch(function (error) {
					console.log("promisse error", error);
					assert.equal(error,null);
					done();
					
                });
                
		});
			
		it('it should return valid visjs factory and parse', (done) => {
			correlation.createCorrelation(data,  2)
					.then(function (dataResp) {

						let visJS = correlation.correlationFactory(correlation.CORRELATION_GRAPHIC_ENUM.VISJS);

						/**
						 * get data for visJS Library and in the entity -> cralwedData format
						 */
						let finalJSON = visJS.parse(dataResp, correlation.CORRELATION_TYPE_ENUM.ENTITY_CRAWLED_DATA);
						assert.equal(finalJSON.data.edges.length, 14);
						assert.equal(finalJSON.data.nodes.length, 11);
						//console.log("final VIsJS JSON", JSON.stringify(finalJSON, null, 3));

						done();

                }).catch(function (error) {
					console.log("promisse error", error);
					assert.equal(error,null);
					done();
					
                });
		});


		it('it should return valid sigmajs factory and parse', (done) => {
			correlation.createCorrelation(data,  2)
					.then(function (dataResp) {

						let sigmaJS = correlation.correlationFactory(correlation.CORRELATION_GRAPHIC_ENUM.SIGMAJS);

						/**
						 * get data for visJS Library and in the entity -> cralwedData format
						 */
						let finalJSON = sigmaJS.parse(dataResp, correlation.CORRELATION_TYPE_ENUM.ENTITY_CRAWLED_DATA);
						assert.equal(finalJSON.edges.length, 14);
						assert.equal(finalJSON.nodes.length, 11);
						//console.log("final SigmaJS JSON", JSON.stringify(finalJSON, null, 3));

						done();

                }).catch(function (error) {
					console.log("promisse error", error);
					assert.equal(error,null);
					done();
					
                });
		});


});


describe('Correlation - advanced', function () {
        

        it('it should return top relations for each of same node', (done) => {
				correlation.createCorrelation(data)
					.then(function (dataResp) {
						//assert.equal(Object.keys(dataResp.keywords).length, 3);
						//assert.equal(dataResp.edges.length, 14);
						//assert.equal(dataResp.nodes.length, 16);

						console.log(JSON.stringify(dataResp, null, 3));
						done();

                }).catch(function (error) {
					console.log("promisse error", error);
					assert.equal(error,null);
					done();
					
                });
                
		});
});