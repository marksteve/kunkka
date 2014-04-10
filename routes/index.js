var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var engine = null;
var streaming = 'not streaming anything';

exports.index = function(req, res){
  res.render('index', {streaming: streaming});
};

function createEngine(torrent) {
  var engine = peerflix(torrent);
  engine.on('ready', function() {
    engine.server.listen(8888);
    console.log('peerflix listening at 8888');
  });
  return engine;
}

function recreateEngine(torrent) {
  if (engine) {
    console.log('recreating peerflix');
    engine.remove(function() {
      engine.destroy();
      engine.server.close(function() {
        engine = createEngine(torrent);
      });
    });
  } else {
    engine = createEngine(torrent);
  }
}

exports.stream = function(req, res){
  readTorrent(req.param('torrent'), function(err, torrent){
    if (!err) {
      recreateEngine(torrent);
    }
    streaming = err ? err : torrent.name;
    console.log('peerflix', streaming);
    res.render('index', {streaming: streaming});
  });
};
