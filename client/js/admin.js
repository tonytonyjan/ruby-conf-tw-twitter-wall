(function start(websocketServerLocation){
  sock = new WebSocket(websocketServerLocation);
  sock.onmessage = function(e){
  }
  sock.onclose = function(e){
    console.warn(e);
    setTimeout(function(){start(websocketServerLocation)}, 5000);
  };
})('ws://localhost:8080/admin');