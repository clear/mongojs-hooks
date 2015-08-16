var mongojs = require("mongojs");
var fnhooks = require("fn-hooks");
var util = require("util");
var _ = require("lodash");

// DB connection helper
var dbConns = { };

mongojs.db = function (key, dbConnectionString) {
	if (dbConnectionString !== undefined)
		dbConns[key] = mongojs(dbConnectionString);
	
	return dbConns[key];
};

// Tenancy helper
mongojs.Database.prototype.tenant = function (tenantName) {
	var db = this;
	var tenant = mongojs.Database.prototype.collection.apply(this, arguments);
	
	tenant.collection = function (collName) {
		// 'this' currently refers to the collection returned as 'tenant' and not the db
		return mongojs.Database.prototype.collection.call(db, tenantName + "." + collName, collName);
	};

	return tenant;
};

// Define collection hooks
var colls = { };

mongojs.reset = function () {
	colls = { };
};

mongojs.collection = function (name) {
	// Use already existing collection if previously created
	if (colls[name] !== undefined)
		return colls[name].prototype;

	// Create retrievable collection
	colls[name] = function () {
		colls[name].super_.apply(this, arguments);
	};

	// Inherit from parent mongojs collection and add pre() and post() hooks
	util.inherits(colls[name], mongojs.Collection);
	fnhooks(colls[name].prototype);

	return colls[name].prototype;
};

mongojs.Database.prototype.collection = _.wrap(mongojs.Database.prototype.collection, function (fn, name, collName) {
	// Create a parent mongojs collection to setup _name and _get fields
	var collection = fn.call(this, name);

	// Now if a pre-defined collection exists (use tenant-less name if it exists), call it with the internal fields retrieved above
	if (colls[collName || name])
		collection = new colls[collName || name](collection._name, collection._get);

	return collection;
});

mongojs.util = {
	// Converts any . and $ characters in key names with the full-length unicode characters.
	// This is necessary since these two characters are illegal in Mongo key names.
	sanitise: function (object) {
		Object.keys(object).forEach(function (key) {
			var sKey = key;
			
			if (/[.|$]/.test(key)) {
				sKey = key.replace(/\./g, "U+FF0E").replace(/\$/g, "U+FF04");
				object[sKey] = object[key];
				delete object[key];
			}
			
			// Recurse
			if (object[sKey] instanceof Object)
				object[sKey] = this.sanitise(object[sKey]);
		}.bind(this));
		
		return object;
	},

	// Will convert full-length unicode chatacters back to their ASCII form.
	unsanitise: function (object) {
		Object.keys(object).forEach(function (sKey) {
			var key = sKey;
			
			if (/(U\+FF0E|U\+FF04)/.test(sKey)) {
				key = sKey.replace(/U\+FF0E/g, ".").replace(/U\+FF04/g, "$");
				object[key] = object[sKey];
				delete object[sKey];
			}
			
			// Recurse
			if (object[key] instanceof Object)
				object[key] = this.unsanitise(object[key]);
		}.bind(this));
		
		return object;
	}
};

module.exports = mongojs;