require("should");
var mongo = require("../mongojs-hooks");

describe("db", function () {
	beforeEach(function () {
		mongo.db("test key", undefined);
	});

	afterEach(function () {
		mongo.db("test key", undefined);
	});

	it("db() - with key and no existing connection  - should return undefined", function () {
		var db = mongo.db("test key");
		(db === undefined).should.be.ok;
	});

	it("db() - with key and name - should return a new database connection", function () {
		var db = mongo.db("test key", "mongojs-hooks-tdd");
		db.should.be.ok;
		db._name.should.equal("mongojs-hooks-tdd");
	});

	it("db() - with key and an existing connection  - should return the database connection", function () {
		var dbFirst = mongo.db("test key", "mongojs-hooks-tdd");
		
		var db = mongo.db("test key");
		db.should.be.ok;
		db._name.should.equal("mongojs-hooks-tdd");
		db.should.equal(dbFirst);
	});
});