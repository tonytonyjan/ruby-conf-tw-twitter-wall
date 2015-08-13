#!/bin/bash

echo "=================== starting ruby websocket... ===================" > /root/server.log
ruby -I. /server/server.rb >> /root/server.log 2>&1 &
RUBY_PID=$!

echo "=================== starting nginx... ===================" >> /root/server.log
nginx -t >> /root/server.log 2>&1
nginx >> /root/server.log 2>&1
service nginx status >> /root/server.log 2>&1

echo "Server has started Ctrl-C and press q to stop" >> /root/server.log
less +F /root/server.log

echo "=================== stoping nginx... ==================="
service nginx stop

echo "=================== stoping ruby websocket... ==================="
kill $RUBY_PID
