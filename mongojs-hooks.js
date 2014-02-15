var mongojs = require("mongojs");

//DB connection helper
var dbConns = { };

mongojs.db = function (key, dbConnectionString) {
	if (dbConnectionString !== undefined)
		dbConns[key] = mongojs(dbConnectionString);
	
	return dbConns[key];
};

module.exports = mongojs;