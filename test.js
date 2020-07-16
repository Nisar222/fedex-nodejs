const ODP = require('array.js');
const { push } = require('./array');

ODP.array.forEach(element => {
  element.Shipdate = Now();
  console.log(element);
});
