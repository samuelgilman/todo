var fs = require('fs');

var ROUTES = {
  POST: { lists: 'post' },
  GET: { lists: 'get' },
  PUT: { lists: 'put' },
  DELETE: { lists: 'del' }
};

var TYPES = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json'
};

module.exports = router;

function router(req, res) {
  var route = _getRoute(req, res);
  Log(route, ['routing', req.method, req.url ]);
  if (req.url !== '/') { _tryPublic(route) } else {
    route.type = TYPES.html; 
    route.view = Views.index;
    send(route);
  }
}

function _tryPublic(route) {
  var path = ('.' + route.req.url);
  fs.exists(path, function (exists) {
    if (!exists) { _tryRoutes(route); } else {
      route.type = _getType(path);
      fs.readFile(path, 'utf8', function (er, view) {
        if (er) { send(route, 404); } else {
          route.view = view;
          send(route);
        }
      });
    }
  });
}

function _tryRoutes(route) {
  var body;
  var req = route.req;
  var method = req.method;
  var resource = (req.url.split('/')[1]);
  var match = ((ROUTES[method] || {})[resource]);
  if (!match) { send(route, 404); } else {
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
      body = (body || '');
      body += chunk;
    });
    req.on('end', function () {
      body = JSON.parse(body || '{}');
      route.body = body;
      route.type = TYPES.json; 
      Controller[match](route, send);
    });
  }
}

function send(route, code, er) {
  code = (code || 200);
  var req = route.req;
  var type = route.type;
  var headers = { 'Content-Type' : type };
  var data = _getData(route, code, er);
  route.res.writeHead(code, headers);
  route.res.write(data);
  route.res.end();
  Log(route, ['routed', req.method, code, type, req.url ]);
}

function _getRoute(req, res) {
  var ip = req.connection.remoteAddress;
  var id = 'xxxxxxxxxx'.replace(/[x]/g, function (c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  return { ip: ip, id: id, req: req, res: res, data: {} }
}

function _getType(path) {
  var parts = path.split('.');
  var ext = parts[(parts.length-1)];
  return TYPES[ext];
}

function _getData(route, code, er) {
  if (code === 200) {
    return (route.view || JSON.stringify(route.data));
  } else if (route.type === TYPES.json) {
    return JSON.stringify({ er: er });
  } else {
    return Views.missing;
  }
}
