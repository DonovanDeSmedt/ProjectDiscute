describe("Hello world", function(){

	var a,b;
	beforeEach(function(){
		a = 6;
		b = 12;
		jasmine.addMatchers({
			toBeRudy: function(){
				return {
					compare: function(actual, expected){
						var result = {};
						result.pass = actual.name === 'rudy';
						return result;
					}
				}
			}
		})
	})
	

	it("return Hello world", function(){
		expect(helloWorld()).toEqual("Hello world");
		expect({name: "rudy"}).toBeRudy();
		expect({name: "johnny"}).not.toBeRudy();
		var a = 12;
		var b = 15;
		expect(a).not.toBe(b);
	});
});