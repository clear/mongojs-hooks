require("should");
var mongo = require("../mongojs-hooks");

describe("util", function () {
	describe("sanitise()", function () {
		it("with an object with plain keys should not change the key", function () {
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
	});

	describe("unsanitise()", function () {
		it("with an object with plain keys should not change the key", function () {
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
	});
});