require("should");
var mongo = require("../mongojs-hooks");
var config = require("./setup");

describe("tenancy", function () {
	var db;

	before(function () {
		db = mongo.db("test");
	});

	it("collection() - with collection name - should return a collection with supplied name", function () {
		var collection = db.collection("tests");
		collection.should.be.ok;
		collection._name.should.equal(config.db + ".tests");
	});

	it("tenant() - with tenant name - should return a collection with supplied name", function () {
		var collection = db.tenant("tenant");
		collection.should.be.ok;
		collection._name.should.equal(config.db + ".tenant");
	});

	it("tenant().collection() - with tenant name - should prepend collection name with tenant name", function () {
		var collection = db.tenant("tenant").collection("tests");
		collection.should.be.ok;
		collection._name.should.equal(config.db + ".tenant.tests");
	});
});