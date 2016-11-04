var request = require("request");
describe("router", function(){
	it("test", function(done){
		request.get("http://localhost:3000/", function(err, res, body){
			expect(res.statusCode).toBe(200);
			console.log(body);
			done();
		})
	});
})