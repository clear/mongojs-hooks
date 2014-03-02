# mongojs-hooks

A lightweight module that wraps [mongojs](https://github.com/mafintosh/mongojs) in pre() and post() hooks with support for multi-tenancy.

[![Build Status](https://travis-ci.org/clear/mongojs-hooks.png)](https://travis-ci.org/clear/mongojs-hooks)
[![NPM version](https://badge.fury.io/js/mongojs-hooks.png)](http://badge.fury.io/js/mongojs-hooks)

## Installation

	$ npm install mongojs-hooks

## Usage

To use hooks, you need to define the collection they will be applied to.

	var mongo = require("mongojs-hooks");
	var myCollection = mongo.collection("my.collection");

	myCollection.pre("save", function (next, object, callback) {
		//Do whatever you want with your object here, validation, mutation, etc.

		//Now call next() to propogate to save()
		next(object, callback);
	});

	myCollection.post("save", function (next) {
		//Will execute after Mongo's save()

		next();
	});

The hook will run for that collection anytime you call save().

	var db = mongo("my.database");
	db.collection("my.collection").save({ my: "object" });

In a multi-tenancy application, your collections will typically be uniquely named but you probably still want to bind the same hooks irrespesctive of the tenant. **mongojs-hooks** introduces a helper `tenant()` function to separate collections from their tenant:

	//Will call pre()/post() hooks and save { my: "object" } to the collection client_name.my.collection
	db.tenant("client_name").collection("my.collection").save({ my: "object" });

**mongojs-hooks** adds one final helper function to assist in sharing a database connection around your application in the form of `db()`.

	//Connects and stores the database connection
	var db1 = mongo.db("db", "my.database");

	//Can be used in a separate file to retrieve the connection above
	var db2 = mongo.db("db");

	//db1 === db2

Aside from the added functions above, **mongojs-hooks** is a transparent wrapper around [mongojs](https://github.com/mafintosh/mongojs) so refer to its documentation for more information.


## Tests

	$ npm test

## Contributing

All contributions are welcome! I'm happy to accept pull requests as long as they conform to the following guidelines:

- Keep the API clean, we prefer ease-of-use over extra features
- Don't break the build and add tests where necessary
- Keep the coding style consistent, we follow [JSHint's Coding Style](http://www.jshint.com/hack/)

Otherwise, please [open an issue](https://github.com/clear/mongojs-hooks/issues/new) if you have any suggestions or find a bug.

## License

[The MIT License (MIT)](https://github.com/clear/mongojs-hooks/blob/master/LICENSE) - Copyright (c) 2013 Clear Learning Systems