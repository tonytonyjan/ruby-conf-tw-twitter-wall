Twitter Wall for Ruby Conference Taiwan 2014
============================================

About
-----

This twitter wall was made for [Ruby conference Taiwan 2014](http://rubyconf.tw/2014/).

Usage
-----

1. `bundle insall`
2. Edit `server/config.yml` and `client/config.json`
3. `ruby -I. server.rb`

Or use `docker`:

1. Edit `server/config.yml` and `client/config.json`
2. `docker build -t ruby-conf-tw-2014-twitter-wall ./`
3. `docker run -it -p 80:80 -p 8080:8080 ruby-conf-tw-2014-twitter-wall`

> You can change the port of 8080 to the port you desired to listen websocket
