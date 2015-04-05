var fs = require('fs');

var index = fs.readFileSync('./app/views/index.html');
var missing = fs.readFileSync('./app/views/missing.html');

module.exports.index = index;
module.exports.missing = missing;
