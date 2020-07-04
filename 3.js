var soap = require('soap');
var arr = require('./tarray.js');
var path = require('path');
var url = path.join(__dirname, 'wsdl', 'RateService_v20.wsdl');
var params = require('./params/rateRequest.js');

console.log(arr);

Object.keys(arr).forEach(function(key) {
  console.log(key, arr[key].ODPair, arr[key].Origin_City);

});