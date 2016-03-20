var mongo = require("../mongojs-hooks");

describe("util", function () {
	describe("sanitise()", function () {
		describe("when null", function () {
			it("should return null", function () {
				should.not.exist(mongo.util.sanitise(null));
			});
		});

		describe("when a string", function () {
			it("contains a '.' should replace with 'U+FF0E'", function () {
				mongo.util.sanitise("hey.there").should.equal("heyU+FF0Ethere");
			});
		});

		describe("when an object", function () {
			it("contains plain keys should not change the key", function () {
				var object = {
					abcdefghiklmnopqrstuvwxyz: "just fine"
				};

				mongo.util.sanitise(object).should.have.property("abcdefghiklmnopqrstuvwxyz");
			});

			it("with a key containing a '.' should replace with 'U+FF0E'", function () {
				var object = {
					"test.this": "not good"
				};

				mongo.util.sanitise(object).should.have.property("testU+FF0Ethis");
			});

			it("with a key containing multiple '.' chars should replace all with 'U+FF0E'", function () {
				var object = {
					"test.this.another.here": "not good"
				};

				mongo.util.sanitise(object).should.have.property("testU+FF0EthisU+FF0EanotherU+FF0Ehere");
			});

			it("with a key containing a '$' should replace with 'U+FF04'", function () {
				var object = {
					"test$this": "not good"
				};

				mongo.util.sanitise(object).should.have.property("testU+FF04this");
			});

			it("with a key containing multiple '$' chars should replace all with 'U+FF04'", function () {
				var object = {
					"test$this$another$here": "not good"
				};

				mongo.util.sanitise(object).should.have.property("testU+FF04thisU+FF04anotherU+FF04here");
			});

			it("with a key containing both '.' and '$' should replace them respectively", function () {
				var object = {
					"here's a $ and now a .": "what an unlikely key!"
				};

				mongo.util.sanitise(object).should.have.property("here's a U+FF04 and now a U+FF0E");
			});

			it("with a sub-object key contains a '.' should replace with 'U+FF0E'", function () {
				var object = {
					"test.one": {
						"test.two": "sub-object"
					}
				};

				var sanitised = mongo.util.sanitise(object);
				sanitised.should.have.property("testU+FF0Eone");
				sanitised["testU+FF0Eone"].should.have.property("testU+FF0Etwo");
			});

			it("should not mutate original object", function () {
				var object = {
					"test.this": "not good"
				};

				mongo.util.sanitise(object);
				object.should.not.have.property("testU+FF0Ethis");
				object.should.have.property("test.this");
			});

			it("should skip object if it contains a _bsontype key", function () {
				// These are special Mongo objects so don't malform them
				var object = {
					_bsontype: "ObjectID",
					"test.this": "ignore"
				};

				var sanitised = mongo.util.sanitise(object);
				sanitised.should.not.have.property("testU+FF0Ethis");
				sanitised.should.have.property("test.this");
			});
		});

		describe("when an Array", function () {
			it("should maintain all elements in the array", function () {
				var array = [
					{ key: "value" },
					{ second: "object" }
				];

				var sanitised = mongo.util.sanitise(array);
				(sanitised instanceof Array).should.be.true;
				sanitised.length.should.equal(2);
				sanitised.should.deep.equal(array);
			});

			it("should sanitise keys in any elements", function () {
				var array = [
					{ "test.one": "value" },
					{ "test.two": "object" }
				];

				var sanitised = mongo.util.sanitise(array);
				sanitised[0].should.have.property("testU+FF0Eone");
				sanitised[1].should.have.property("testU+FF0Etwo");
			});
		});

		describe("when includes a Date", function () {
			it("should not alter date", function () {
				var date = new Date("2015-03-02");

				var sanitised = mongo.util.sanitise({ date: date });
				(sanitised.date instanceof Date).should.be.true;
				sanitised.date.should.deep.equal(new Date("2015-03-02"));
			});
		});
	});

	describe("unsanitise()", function () {
		describe("when null", function () {
			it("should return null", function () {
				should.not.exist(mongo.util.unsanitise(null));
			});
		});

		describe("when a string", function () {
			it("contains a '.' should replace with 'U+FF0E'", function () {
				mongo.util.unsanitise("heyU+FF0Ethere").should.equal("hey.there");
			});
		});

		describe("when an object", function () {
			it("containing plain keys should not change the key", function () {
				var object = {
					abcdefghiklmnopqrstuvwxyz: "just fine"
				};

				mongo.util.unsanitise(object).should.have.property("abcdefghiklmnopqrstuvwxyz");
			});

			it("with a key containing a 'U+FF0E' should replace with '.'", function () {
				var object = {
					"testU+FF0Ethis": "not good"
				};

				mongo.util.unsanitise(object).should.have.property("test.this");
			});

			it("with a key containing multiple 'U+FF0E' codes should replace all with '.'", function () {
				var object = {
					"testU+FF0EthisU+FF0EanotherU+FF0Ehere": "not good"
				};

				mongo.util.unsanitise(object).should.have.property("test.this.another.here");
			});

			it("with a key containing a 'U+FF04' should replace with '$'", function () {
				var object = {
					"testU+FF04this": "not good"
				};

				mongo.util.unsanitise(object).should.have.property("test$this");
			});

			it("with a key containing multiple 'U+FF04' codes should replace all with '$'", function () {
				var object = {
					"testU+FF04thisU+FF04anotherU+FF04here": "not good"
				};

				mongo.util.unsanitise(object).should.have.property("test$this$another$here");
			});

			it("with a key containing both 'U+FF0E' and 'U+FF04' should replace them respectively", function () {
				var object = {
					"here's a U+FF04 and now a U+FF0E": "what an unlikely key!"
				};

				mongo.util.unsanitise(object).should.have.property("here's a $ and now a .");
			});

			it("with a sub-object key contains a 'U+FF0E' code should replace with '.'", function () {
				var object = {
					"testU+FF0Eone": {
						"testU+FF0Etwo": "sub-object"
					}
				};

				var unsanitised = mongo.util.unsanitise(object);
				unsanitised.should.have.property("test.one");
				unsanitised["test.one"].should.have.property("test.two");
			});

			it("should not mutate original object", function () {
				var object = {
					"testU+FF0Ethis": "not good"
				};

				mongo.util.unsanitise(object);
				object.should.not.have.property("test.this");
				object.should.have.property("testU+FF0Ethis");
			});

			it("should skip object if it contains a _bsontype key", function () {
				// These are special Mongo objects so don't malform them
				var object = {
					_bsontype: "ObjectID",
					"testU+FF0Ethis": "ignore"
				};

				var unsanitised = mongo.util.unsanitise(object);
				unsanitised.should.not.have.property("test.this");
				unsanitised.should.have.property("testU+FF0Ethis");
			});
		});

		describe("when an Array", function () {
			it("should maintain all elements in the array", function () {
				var array = [
					{ key: "value" },
					{ second: "object" }
				];

				var unsanitised = mongo.util.unsanitise(array);
				(unsanitised instanceof Array).should.be.true;
				unsanitised.length.should.equal(2);
				unsanitised.should.deep.equal(array);
			});

			it("should unsanitise keys in any elements", function () {
				var array = [
					{ "testU+FF0Eone": "value" },
					{ "testU+FF0Etwo": "object" }
				];

				var unsanitised = mongo.util.unsanitise(array);
				unsanitised[0].should.have.property("test.one");
				unsanitised[1].should.have.property("test.two");
			});
		});

		describe("when includes a Date", function () {
			it("should not alter date", function () {
				var date = new Date("2015-03-02");

				var unsanitised = mongo.util.unsanitise({ date: date });
				(unsanitised.date instanceof Date).should.be.true;
				unsanitised.date.should.deep.equal(new Date("2015-03-02"));
			});
		});
	});

	describe("flatten()", function () {
		describe("when an object", function () {
			it("and nested", function () {
				var object = {
					first: {
						second: "value"
					}
				};

				var flattened = mongo.util.flatten(object);
				flattened.should.deep.equal({
					"first.second": "value"
				});
			});

			it("with multiple values", function () {
				var object = {
					first: {
						second: "value",
						third: "val"
					}
				};

				var flattened = mongo.util.flatten(object);
				flattened.should.deep.equal({
					"first.second": "value",
					"first.third": "val"
				});
			});

			it("and contains an Array", function () {
				var object = {
					first: {
						second: [ "el1", "el2", "el3" ]
					}
				};

				var flattened = mongo.util.flatten(object);
				flattened.should.deep.equal({
					"first.second": [ "el1", "el2", "el3" ]
				});
			});

			it("should not mutate original object", function () {
				var object = {
					first: {
						second: "value"
					}
				};

				mongo.util.flatten(object);
				object.should.not.have.property("first.second");
				object.should.deep.equal({
					first: {
						second: "value"
					}
				});
			});
		});
	});
});