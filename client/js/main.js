var $container = $('#tweets');
$container.masonry({
  itemSelector: '.tweet',
  gutter: 5
});

// load config
$.ajax('/config.json', {dataType: "json"}).done(function(config){
  // websocket
  tweets = document.getElementById('tweets');
  (function start(websocketServerLocation){
    sock = new WebSocket(websocketServerLocation);
    sock.onmessage = function(e) {
      json = JSON.parse(e.data);
      console.debug(json);
      switch(json.op){
      case 'msg':
        break;
      case 'tweet':
        data = json.data;
        img = new Image;
        // preload profile image
        img.onload = function(){
          img.setAttribute('class', 'media-object');
          tweet = $('<div class="tweet"><div class="media well"><a class="pull-left" href="#"></a><div class="media-body"><h4 class="media-heading">'+data.user.screen_name+'</h4>'+data.text+'</div></div></div>')[0]
          tweet.querySelector('.media > a').appendChild(img);
          $container.prepend(tweet).masonry('prepended', tweet);
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