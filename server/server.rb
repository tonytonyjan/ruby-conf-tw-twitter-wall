require 'bundler/setup'
require 'em-websocket'
require 'em-twitter'
require 'json'
require 'settingslogic'
require 'settings'

EventMachine.run {
  @channel = EM::Channel.new
  options = {
    path: '/1.1/statuses/filter.json',
    params: {track: 'ruby'},
    oauth: Settings.oauth
  }
  client = EM::Twitter::Client.connect(options)
  client.each do |tweet|
    # ref: https://dev.twitter.com/docs/platform-objects/tweets
    tweet = JSON.parse(tweet)
    @channel.push({op: :tweet, data: tweet}.to_json)
  end

  EventMachine::WebSocket.start(host: "0.0.0.0", port: 8080, debug: true) do |ws|
    ws.onopen {
      sid = @channel.subscribe { |msg| ws.send msg }
      puts "##{sid} connected."
      ws.send({op: :msg, data: 'Welcome!'}.to_json)

      ws.onmessage { |msg|
        @channel.push "<##{sid}>: #{msg}"
      }

      ws.onclose {
        @channel.unsubscribe(sid)
        puts "##{sid} closed."
      }
    }
  end

  puts "Server started"
}