require 'bundler/setup'
require 'em-websocket'
require 'em-twitter'
require 'json'
require 'settingslogic'
require 'settings'
require 'redis'
EM.run {
  @channel = EM::Channel.new
  # ref: https://dev.twitter.com/docs/streaming-apis/parameters#track
  EM::Twitter::Client.connect(Settings.twitter).each do |tweet|
    # ref: https://dev.twitter.com/docs/platform-objects/tweets
    @channel.push(%Q({"op": "tweet", "data": #{tweet}}))
  end
  EM::WebSocket.run(host: "0.0.0.0", port: 8080, debug: true) do |ws|
    ws.onopen { |handshake|
      case handshake.path
      when '/'
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
      when '/admin'
        ws.send({op: :msg, data: 'Welcome to control panel!'})
        ws.onmessage{ |msg| }
      end
    }
  end

  puts "Server started"
}