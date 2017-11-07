/**
 * Testes para funcoes dos filtros do orchestrator

 */

require('dotenv').config()
var assert = require('assert');
var should = require('should');

var filter = require('../helpers/orchestrator/filter')();

describe('Filter - By Entity', function () {

	it('it should return valid filter by entity', (done) => {
		let data = [
			{ text : "ibm" },
			{ text : "apple" }];
			
		assert.equal(filter.byEntity(data, "ibm").length, 1);
		assert.equal(filter.byEntity(data, "apple").length, 1);
		assert.equal(filter.byEntity(data, "xxxx").length, 0);
		done();

	});

	it('it should return valid filter by source', (done) => {
		let data = [
			{ source : "facebook" },
			{ source : "twitter" }];
			
		assert.equal(filter.bySource(data, {facebook: true}).length, 1);
		assert.equal(filter.bySource(data, {instagram: true}).length, 0);
		assert.equal(filter.bySource(data, {twitter: true}).length, 1);
		
		done();

	});

	it('it should return valid filter by profile', (done) => {
		let data = [
			{ profile : "profile1" },
			{ profile : "profile2" }];
			
		assert.equal(filter.byProfile(data, {profile1: true}).length, 1);
		assert.equal(filter.byProfile(data, {profile2: true}).length, 1);
		assert.equal(filter.byProfile(data, {profile3: true}).length, 0);
		
		done();

	});

	it('it should return valid filter by sentiment', (done) => {
		let data = [
			{ sentiment : {label : "label1" }},
			{ sentiment : {label: "label2" }}];
			
		assert.equal(filter.bySentiment(data, {label1: true}).length, 1);
		assert.equal(filter.bySentiment(data, {label2: true}).length, 1);
		assert.equal(filter.bySentiment(data, {label3: true}).length, 0);
		
		done();

	});

	it('it should return valid filter by context', (done) => {
		var filterTest = require('../helpers/orchestrator/filter')({
			"keywordRelevance": 0.5,
			"categoryRelevance": 0.5,
			"validLanguages": ["de", "fr", "ja", "es", "pt", "en"]
			});
		

		let data = [
			{ categories : [{score : 1, label: "label1" },
							{score : 2, label: "label2" }, 
							{score : 0.2, label: "label3" },
							{score : 0.5, label: "label4" }]}
		];
			
		assert.equal(filterTest.byContext(data, ["label1"]).length, 1);
		assert.equal(filterTest.byContext(data, ["label1", "label2"]).length, 2);
		assert.equal(filterTest.byContext(data, ["label1", "label2", "label3"]).length, 2);
		assert.equal(filterTest.byContext(data, ["label1", "label2", "label3", "label4"]).length, 3);
		
		
		done();

	});

	it('it should return valid filter by date', (done) => {
		let data = [
			{ date : "2017-01-02"},
			{ date : "2017-12-01"},
			{ date : "2019-01-01"}
		];
			
		assert.equal(filter.byDate(data, "2017-01-01", "2018-01-01").length, 2);
		assert.equal(filter.byDate(data, "2016-01-01", "2020-01-01").length, 3);
		done();

	});



	
});