var fs = require('fs');
var http = require('http');

var DATABASE = './app/DATABASE'; 
var PORT = (process.env.PORT || 3000);
var HOST = (process.env.HOST || '127.0.0.1');

var tests = [
  { test: validRoute, should: 'return 200' },
  { test: invalidRoute, should: 'return 404' },
  { test: postList, should: 'create a list' },
  { test: getLists, should: 'get all lists' },
  { test: getList, should: 'get a list' },
  { test: putList, should: 'update a list' },
];

run();

function validRoute(next) {
  var options = { path: '/', method: 'GET' };
  request(options, function (er, res, data) {
    if (er) { next(er); } else {
      next(er, res.statusCode === 200);
    }
  });
}

function invalidRoute(next) {
  var options = { path: '/invalid', method: 'GET' };
  request(options, function (er, res, data) {
    if (er) { next(er); } else {
      next(er, res.statusCode === 404);
    }
  });
}

function postList(next) {
  var options = { path: '/lists', method: 'POST', data: {} };
  request(options, function (er, res, data) {
    if (er) { next(er); } else {
      data = JSON.parse(data);
      next(er, (data.uuid.length === 36));
    }
  });
}

function getLists(next) {
  var options = { path: '/lists', method: 'POST', data: {} };
  request(options, function (er, res, data) {
    if (er) { next(er); } else {
      var options = { path: '/lists', method: 'GET' };
      request(options, function (er, res, data) {
        data = JSON.parse(data);
        next(er, Array.isArray(data));
      });
    }
  });
}

function getList(next) {
  var options = { path: '/lists', method: 'POST', data: {} };
  request(options, function (er, res, data) {
    if (er) { next(er); } else {
      data = JSON.parse(data);
      var uuid = data.uuid;
      var options = { path: ('/lists/' + uuid), method: 'GET' };
      request(options, function (er, res, data) {
        data = JSON.parse(data);
        next(er, data.uuid === uuid);
      });
    }
  });
}

function putList(next) {
  var options = { path: '/lists', method: 'POST', data: {} };
  request(options, function (er, res, data) {
    if (er) { next(er); } else {
      data = JSON.parse(data);
      data.title = new Date().getTime();
      var title = data.title;
      var uuid = data.uuid;
      var options = { path: ('/lists/' + uuid), method: 'PUT', data: data };
      request(options, function (er, res, data) {
        var options = { path: ('/lists/' + uuid), method: 'GET' };
        request(options, function (er, res, data) {
          data = JSON.parse(data);
          next(er, data.title === title);
        });
      });
    }
  });
}

function run() {
  var test = tests.shift();
  if (!test) { return }
  flush();
  test.test(function (er, passed) {
    var name = testName(test.test);
    var should = test.should;
    var result = passed ? 'PASSED' : 'FAILED';
    console.log(result, name, 'should', should);
    run();
  });
}

function flush() {
  var exists = fs.existsSync(DATABASE);
  if (exists) { fs.unlinkSync(DATABASE); }
}

function request(params, next) {
  var path = params.path;
  var method = params.method;
  var data = JSON.stringify(params.data);
  var options = {
    hostname: HOST,
    port: PORT,
    path: path,
    method: method,
    headers: {}
  };
  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      next(null, res, data);
    });
  });
  req.on('error', next);
  if (data) { req.write(data); }
  req.end();
}

function testName(test) {
  var name = test.toString();
  name = name.substr('function '.length);
  name = name.substr(0, name.indexOf('('));
  return name;
}
