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

	describe("single collection", function () {
		var saveStub;

		beforeEach(function () {
			saveStub = sinon.stub(mongojs.Collection.prototype, "save").callsArg(1);
		});

		afterEach(function () {
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
				object.should.have.property("test");
				object.test.should.equal("property");

				next(object, callback);
			});

			db.collection("tests").save({ test: "property" }, function () {
				preStub.callCount.should.equal(1);
				mongojs.Collection.prototype.save.calledWith({ test: "property" }).should.be.ok;

				done();
			});
		});

		it("save() - with post() hook on defined collection - should call post() hook after save()", function (done) {
			var tests = mongo.collection("tests");
			var postStub = sinon.stub();

			tests.post("save", function (next) {
				mongojs.Collection.prototype.save.calledWith({ test: "property" }).should.be.ok;
				postStub();
				next();
			});

			db.collection("tests").save({ test: "property" }, function () {
				postStub.callCount.should.equal(1);

				done();
			});
		});

		it("save() - with pre() hook on defined collection and accessed via tenant - should call pre() hook before save()", function (done) {
			var tests = mongo.collection("tests");
			var preStub = sinon.stub();

			tests.pre("save", function (next, object, callback) {
				preStub.callCount.should.equal(0);
				preStub();
				object.should.have.property("test");
				object.test.should.equal("property");

				next(object, callback);
			});

			db.tenant("tenant").collection("tests").save({ test: "property" }, function () {
				preStub.callCount.should.equal(1);
				mongojs.Collection.prototype.save.calledWith({ test: "property" }).should.be.ok;

				done();
			});
		});
	});

	describe("multiple collections", function () {
		var saveStub;

		beforeEach(function () {
			saveStub = sinon.stub(mongojs.Collection.prototype, "save").callsArg(1);
		});

		afterEach(function () {
			saveStub.restore();
		});

		it("save() - with single defined collection and pre() hook called twice - should call hook on collection twice", function (done) {
			var tests = mongo.collection("tests");
			var preStub = sinon.stub();

			tests.pre("save", function (next, object, callback) {
				preStub();
				next(object, callback);
			});

			db.collection("tests").save({ test1: "property1" }, function () {
				db.collection("tests").save({ test2: "property2" }, function () {
					preStub.callCount.should.equal(2);

					mongojs.Collection.prototype.save.callCount.should.equal(2);
					mongojs.Collection.prototype.save.getCall(0).calledWith({ test1: "property1" }).should.be.ok;
					mongojs.Collection.prototype.save.getCall(1).calledWith({ test2: "property2" }).should.be.ok;

					done();
				});
			});
		});

		it("save() - with two defined collections and pre() hook one one - should only call hook on the collection defined", function (done) {
			mongo.collection("test1");
			var test2 = mongo.collection("test2");
			var preStub = sinon.stub();

			test2.pre("save", function (next, object, callback) {
				preStub.callCount.should.equal(0);
				preStub();

				object.should.have.property("test2");
				object.test2.should.equal("property2");

				next(object, callback);
			});

			db.collection("test1").save({ test1: "property1" }, function () {
				db.collection("test2").save({ test2: "property2" }, function () {
					//It's important that this is only 1 since the 2nd collection doesn't have a hook
					preStub.callCount.should.equal(1);

					mongojs.Collection.prototype.save.callCount.should.equal(2);
					mongojs.Collection.prototype.save.getCall(0).calledWith({ test1: "property1" }).should.be.ok;
					mongojs.Collection.prototype.save.getCall(1).calledWith({ test2: "property2" }).should.be.ok;

					done();
				});
			});
		});
	});
});