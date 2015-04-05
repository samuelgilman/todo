module.exports = log;

function log(route, items) {
  var ip = route.ip;
  var id = route.id;
  var time = new Date().getTime();
  var result = [time, ip, id];
  while (items.length) {
    var item = items.shift();
    if (typeof item === 'object') {
      item = JSON.stringify(item);
    }
    result.push(item);
  }
  result = result.join(' ');
  console.log(result);
}
