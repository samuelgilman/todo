var UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

module.exports.insert = insert;
module.exports.find = find;
module.exports.save = save;
module.exports.remove = remove;

function insert(route, next) {
  var list = _build();
  save(route, list, function (er) {
    if (er) { next(er); } else {
      next(er, list);
    }
  });
}

function find(route, uuid, next) {
  Db.read(function (er, json) {
    if (er) { next(er); } else {
      if (!uuid) { _findAll(route, json, next); } else {
        var list = json.lists[uuid];
        Log(route, ['list findOne', uuid, !!list]);
        if (!list) { next('list not found'); } else {
          next(er, list);
        }
      }
    }
  });
}

function save(route, list, next) {
  var uuid = list.uuid;
  Db.read(function (er, json) {
    if (er) { next(er); } else {
      json.lists[uuid] = list;
      Db.write(json, function (er) {
        if (!er) { Log(route, ['list save', uuid]) }
        next(er, list);
      });
    }
  });
}

function remove(route, uuid, next) {
  Db.read(function (er, json) {
    if (er) { next(er); } else {
      delete json.lists[uuid];
      Db.write(json, function (er) {
        if (!er) { Log(route, ['list remove', uuid])}
        next(er);
      });
    }
  });
}

function _findAll(route, json, next) {
  var data = [];
  var lists = json.lists;
  for (var uuid in lists) {
    data.push(lists[uuid]);
  }
  Log(route, ['list findAll', data.length]);
  next(null, data);
}

function _build() {
  var uuid = _buildUuid();
  var time = new Date().getTime();
  return { uuid: uuid, created: time };
}

function _buildUuid() {
  return UUID.replace(/[xy]/g, function (c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
