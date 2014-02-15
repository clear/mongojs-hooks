var mongojs = require("mongojs");
var fnhooks = require("fn-hooks");
var util = require("util");
var _ = require("lodash");

//DB connection helper
var dbConns = { };

mongojs.db = function (key, dbConnectionString) {
	if (dbConnectionString !== undefined)
		dbConns[key] = mongojs(dbConnectionString);
	
	return dbConns[key];
};

//Tenancy helper
mongojs.Database.prototype.tenant = function () {
	var tenant = mongojs.Database.prototype.collection.apply(this, arguments);
	
	tenant.collection = function (name) {
		//'this' currently refers to the collection returned as 'tenant' and not the db
		return mongojs.Database.prototype.collection.call(this, name);
	};

	return tenant;
};

//Define collection hooks
var colls = { };

mongojs.collection = function (name) {
	//Create retrievable collection
	colls[name] = function () {
		colls[name].super_.apply(this, arguments);
	};

	util.inherits(colls[name], mongojs.Collection);

	//Create wrapper prototype functions
	/*
	Object.keys(mongojs.Collection.prototype).forEach(function (property) {
		if (typeof mongojs.Collection.prototype[property] === "function") {
			colls[name].prototype[property] = function () {
				console.log("proxy fn");
				mongojs.Collection.prototype.apply(this, arguments);
			};
		}
	});
	*/

	fnhooks(colls[name].prototype);

	return colls[name].prototype;
};

mongojs.Database.prototype.collection = _.wrap(mongojs.Database.prototype.collection, function (fn, name) {
	//Create a parent mongojs collection to setup _name and _get fields
	var collection = fn.call(this, name);

	//Now if a pre-defined collection exists, call it with the internal fields retrieved above
	if (colls[name])
		collection = new colls[name](collection._name, collection._get);

	return collection;
});

module.exports = mongojs;