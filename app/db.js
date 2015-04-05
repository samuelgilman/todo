var fs = require('fs');
var DATABASE = (process.env.DATABASE || './app/DATABASE');

module.exports.read = read;
module.exports.write = write;

function read(next) {
  fs.exists(DATABASE, function (exists) {
    if (!exists) { next(null, { lists: {} });  } else {
      fs.readFile(DATABASE, function (er, buffer) {
        if (er) { next(er); } else {
          var string = buffer.toString();
          var json = JSON.parse(string);
          next(null, json);
        }
      });
    }
  });
}

function write(json, next) {
  json.touched = new Date().getTime();
  fs.writeFile(DATABASE, JSON.stringify(json), next);
}
