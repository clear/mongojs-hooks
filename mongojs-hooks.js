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
mongojs.Database.prototype.tenant = function (tenantName) {
	var db = this;
	var tenant = mongojs.Database.prototype.collection.apply(this, arguments);
	
	tenant.collection = function (collName) {
		//'this' currently refers to the collection returned as 'tenant' and not the db
		return mongojs.Database.prototype.collection.call(db, tenantName + "." + collName, collName);
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

	//Inherit from parent mongojs collection and add pre() and post() hooks
	util.inherits(colls[name], mongojs.Collection);
	fnhooks(colls[name].prototype);

	return colls[name].prototype;
};

mongojs.Database.prototype.collection = _.wrap(mongojs.Database.prototype.collection, function (fn, name, collName) {
	//Create a parent mongojs collection to setup _name and _get fields
	var collection = fn.call(this, name);

	//Now if a pre-defined collection exists (use tenent-less name if it exists), call it with the internal fields retrieved above
	if (colls[collName || name])
		collection = new colls[collName || name](collection._name, collection._get);

	return collection;
});

module.exports = mongojs;