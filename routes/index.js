var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var engine = null;
var watchPort = process.env.KUNKKA_WATCH_PORT || 8888;
var watchUrl = process.env.KUNKKA_WATCH_URL || ("http://localhost:" + watchPort);

/* render index page */

exports.index = function(req, res){
  res.render('index');
};

/* peerflix setup */

function createEngine(torrent, onready){
  var engine = peerflix(torrent);
  engine.on('ready', function(){
    onready(engine.files[0]);
    engine.server.listen(watchPort);
    console.log('peerflix listening at', watchPort);
  });
  return engine;
}

function removeEngine(cb){
  if (engine && !engine.swarm._destroyed) {
    engine.remove(function(){
      engine.destroy();
      engine.server.close(cb);
    });
  } else {
    cb();
  }
}

function recreateEngine(torrent, onready){
  if (engine) {
    console.log('recreating peerflix');
    removeEngine(function() {
      engine = createEngine(torrent, onready);
    });
  } else {
    engine = createEngine(torrent, onready);
  }
}

/* sockjs events */

function sendMsg(conn, evt) {
  conn.write(JSON.stringify({
    evt: evt,
    args: Array.prototype.slice.call(arguments, 2)
  }));
}

function stream(filename){
  var conn = this;
  sendMsg(conn, 'status', "getting torrent info");
  function showStreaming(file){
    console.log('peerflix', file.name);
    sendMsg(conn, 'status', "change stream");
    sendMsg(conn, 'streaming', file.name, watchUrl);
  }
  if (/^magnet:/.test(filename)) {
    recreateEngine(filename, showStreaming);
  } else {
    readTorrent(filename, function(err, torrent){
      if (err) {
        sendMsg(conn, 'status', "error loading torrent");
      } else {
        recreateEngine(torrent, showStreaming);
      }
    });
  }
};

function stop(){
  var conn = this;
  removeEngine(function() {
    console.log('stop');
    sendMsg(conn, 'status', "stream");
    sendMsg(conn, 'streaming');
  });
};

var handlers = {
  stream: stream,
  stop: stop
};

exports.ws = function(conn) {
  var streaming =
    engine ? (
      !engine.swarm._destroyed &&
      engine.files.length > 0 ?  (
        engine.files[0].name
      ) : null
    ) : null;
  if (streaming) {
    sendMsg(conn, 'streaming', streaming, watchUrl);
    sendMsg(conn, 'status', "change stream");
  } else {
    sendMsg(conn, 'streaming');
    sendMsg(conn, 'status', "stream");
  }
  conn.on('data', function(message) {
    message = JSON.parse(message);
    handlers[message.evt].apply(conn, message.args);
  });
};
