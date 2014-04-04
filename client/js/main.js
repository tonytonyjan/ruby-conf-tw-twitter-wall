// handlebar
var source = $("#tweet_template").html();
var template = Handlebars.compile(source);

// load config
$.ajax('/config.json', {dataType: "json"}).done(function(config){
  // websocket
  tweets = document.getElementById('tweets');
  (function start(websocketServerLocation){
    sock = new WebSocket(websocketServerLocation);
    sock.onmessage = function(e) {
      var json = JSON.parse(e.data);
      console.debug(json);
      switch(json.op){
      case 'msg':
        break;
      case 'tweet':
        var data = json.data;
        var html = template(data);
        var img = new Image;
        // preload profile image
        img.onload = function(){
          $(html).hide().prependTo('#tweets').slideDown();
          if($('.tweet').length > (config.max_tweet || 5)) $('.tweet').last().remove();
        }
        img.src = data.user.profile_image_url;
        break;
      default:
        console.debug(json);
      }
    }
    sock.onclose = function(e){
      console.warn(e);
      // reconnect in 5 seconds
      setTimeout(function(){start(websocketServerLocation)}, 5000);
    };
  })(config.server);
});