$(function() {

var sock = new SockJS(location.origin + '/ws');

function sendMsg(evt){
  sock.send(JSON.stringify({
    evt: evt,
    args: Array.prototype.slice.call(arguments, 1)
  }));
}

function stream(){
  sendMsg('stream', $('.torrent').val());
}

function stop(){
  sendMsg('stop');
};

sock.onopen = function(){
  $('.stream').click(stream);
  $('.stop').click(stop);
};

function status(message, disabled){
  $('.stream').text(message).prop('disabled', !!disabled);
}

function streaming(filename, url){
  $('.stop').toggle(typeof filename != 'undefined');
  filename = filename || "enter a magnet/torrent url to stream";
  if (url) {
    filename += " (" + url + ")";
  }
  url = url || "https://google.com";
  $('.streaming').text(filename).attr('href', url);
}

var handlers = {
  status: status,
  streaming: streaming,
};

sock.onmessage = function(message){
  message = JSON.parse(message.data);
  handlers[message.evt].apply(this, message.args);
};

sock.onclose = function(){
};

});
