var chai = require("chai");
chai.config.includeStack = true;
global.should = chai.should();

var mongo = require("../mongojs-hooks");

module.exports = {
	db: "mongojs-hooks-tdd"
};

before(function () {
	mongo.db("test", module.exports.db);
});