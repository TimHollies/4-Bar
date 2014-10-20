requirejs(["engine/parser"], function(parser) {
    var expect = chai.expect;

    describe("The parser ", function() {
        it("should create an array of length 1 when parsing 'A'", function() {
                var output = parser({ action: "add", raw: "A" });
                expect(output.parsed.length).to.equal(1);
        });

        it("should create an array of length 2 when parsing 'AA'", function() {

                var output = parser({ action: "add", raw: "AA" });
                expect(output.parsed.length).to.equal(2);
        });
    });
});