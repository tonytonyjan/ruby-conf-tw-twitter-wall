require 'bundler/setup'
require 'em-websocket'
require 'em-twitter'
require 'json'
require 'settingslogic'
require 'settings'

if Settings.babel_transpiler.to_hash[:enabled]
  require 'babel/transpiler'
  Encoding.default_external = 'utf-8'

  src_folder = Settings.babel_transpiler.to_hash[:source] || "../client/_src/"
  tar_folder = Settings.babel_transpiler.to_hash[:target] || "../client/js/"
  puts "Compiling jsx from '#{src_folder}' to js '#{tar_folder}' ..."
  Dir[ src_folder + "*.jsx" ].each do |f|
    result_file = tar_folder + f.split("/")[-1].split(".")[0] + ".js"
    puts ">> '#{f}' > '#{result_file}'"
    File.write(
      result_file,
      Babel::Transpiler.transform(File.read(f))["code"]
    )
  end
  puts "Compilation OK!"
end

tweet_track = Settings.twitter.to_hash[:params][:track]
puts "Starting server for pushing tweet #{tweet_track}"
begin
  EM.run {
    @channel = EM::Channel.new
    # ref: https://dev.twitter.com/docs/streaming-apis/parameters#track
    EM::Twitter::Client.connect(Settings.twitter).each do |tweet|
      # ref: https://dev.twitter.com/docs/platform-objects/tweets
      @channel.push(%Q({"op": "tweet", "data": #{tweet}}))
    end
    EM::WebSocket.run(host: "0.0.0.0", port: 8080, debug: true) do |ws|
      ws.onopen { |handshake|
        sid = @channel.subscribe { |msg| ws.send msg }
        puts "##{sid} connected."
        ws.send({op: :msg, data: "Welcome! Now tracking ##{tweet_track}"}.to_json)

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
rescue EventMachine::ConnectionError => e
  $stderr.puts e.message
  sleep 5
  retry
end
