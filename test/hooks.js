require("should");
var sinon = require("sinon");
var mongo = require("../mongojs-hooks");
var mongojs = require("mongojs");
var config = require("./setup");

describe("hooks", function () {
	var db;

	before(function () {
		db = mongo.db("test");
	});

	describe("defining collection", function () {
		it("mongo.collection() - with collection name - should define a retrievable collection on db", function () {
			mongo.collection("tests");

			db.collection("tests").should.be.ok;
			db.collection("tests")._name.should.equal(config.db + ".tests");
		});

		it("mongo.collection() - with collection name - should define a retrievable collection on tenant", function () {
			mongo.collection("tests");

			db.tenant("tenant").collection("tests").should.be.ok;
			db.tenant("tenant").collection("tests")._name.should.equal(config.db + ".tenant.tests");
		});

		it("mongo.collection() - with collection name - should have pre(), post(), etc. hook functions", function () {
			var tests = mongo.collection("tests");
			tests.should.have.property("pre");
			tests.should.have.property("post");
			tests.should.have.property("removePre");
			tests.should.have.property("removePost");
		});
	});

	describe("saving", function () {
		var saveStub;

		before(function () {
			saveStub = sinon.stub(mongojs.Collection.prototype, "save").callsArg(1);
		});

		after(function () {
			saveStub.restore();
		});

		it("save() - with object - should save that object to the database", function (done) {
			db.collection("tests").save({ test: "property" }, function () {
				mongojs.Collection.prototype.save.calledWith({ test: "property" }).should.be.ok;
				done();
			});
		});

		it("save() - on defined collection - should save that object to the database", function (done) {
			mongo.collection("tests");

			db.collection("tests").save({ test: "property" }, function () {
				mongojs.Collection.prototype.save.calledWith({ test: "property" }).should.be.ok;
				done();
			});
		});

		it("save() - with pre() hook on defined collection - should call pre() hook before save()", function (done) {
			var tests = mongo.collection("tests");
			var preStub = sinon.stub();

			tests.pre("save", function (next, object, callback) {
				preStub.callCount.should.equal(0);
				preStub();
				next(object, callback);
			});

			db.collection("tests").save({ test: "property" }, function () {
				preStub.callCount.should.equal(1);
				mongojs.Collection.prototype.save.calledWith({ test: "property" }).should.be.ok;

				done();
			});
		});
	});
});
