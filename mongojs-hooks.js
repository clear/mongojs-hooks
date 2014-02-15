var mongojs = require("mongojs");

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

module.exports = mongojs;