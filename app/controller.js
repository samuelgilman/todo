module.exports.post = post;
module.exports.get = get;
module.exports.put = put;
module.exports.del = del;

function post(route, next) {
  Model.insert(route, function (er, list) {
    if (er) { next(route, 500, er); } else {
      route.data = list;
      next(route);
    }
  });
}

function get(route, next) {
  var uuid = _getUuid(route);
  Model.find(route, uuid, function (er, data) {
    if (er) { next(route, 500, er); } else {
      route.data = data;
      next(route);
    }
  });
}

function put(route, next) {
  var list = route.body;
  Model.save(route, list, function (er) {
    if (er) { next(route, 500, er); } else {
      next(route);
    }
  });
}

function del(route, next) {
  var uuid = _getUuid(route);
  Model.remove(route, uuid, function (er) {
    if (er) { next(route, 500, er); } else {
      next(route);
    }
  });
}

function _getUuid(route) {
  return route.req.url.split('/')[2];
}
