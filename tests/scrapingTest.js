let assert = require('chai').assert;
let expect = require('chai').expect;
const util = require('util');
let app = require("../server/server");
describe('Data Set test', function() {

  it('appDev func', async () =>  {
    const func = util.promisify(app.models.DataSet.appDevelopment)
    const result = await func(); 

    // expect(result).to.be.a('object');
    // expect(result).have.property('result');
    // expect(result.result).equal('success');
 
  });

});