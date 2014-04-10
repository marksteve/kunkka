var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var engine = null;
var streaming = 'not streaming anything';

exports.index = function(req, res){
  res.render('index', {streaming: streaming});
};

function createEngine(torrent, onready) {
  var engine = peerflix(torrent);
  engine.on('ready', function() {
    onready(engine.files[0]);
    engine.server.listen(8888);
    console.log('peerflix listening at 8888');
  });
  return engine;
}

function recreateEngine(torrent, onready) {
  if (engine) {
    console.log('recreating peerflix');
    engine.remove(function() {
      engine.destroy();
      engine.server.close(function() {
        engine = createEngine(torrent, onready);
      });
    });
  } else {
    engine = createEngine(torrent, onready);
  }
}

exports.stream = function(req, res){
  var filename = req.param('torrent');
  function showStreaming(file) {
    console.log('peerflix', file.name);
    streaming = file.name;
    res.render('index', {streaming: streaming});
  }
  if (/^magnet:/.test(filename)) {
    recreateEngine(filename, showStreaming);
  } else {
    readTorrent(filename, function(err, torrent){
      if (err) {
        streaming = err;
        res.render('index', {streaming: err});
      } else {
        recreateEngine(torrent, showStreaming);
      }
    });
  }
};
