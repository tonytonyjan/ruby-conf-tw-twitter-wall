# product: -it -p 80:80 -p 8080:8080
# dev: -it -p 80:80 -p 8080:8080 -v $(pwd)/server/:/server -v $(pwd)/client/:/client
# dockerRun: -it -p 80:80 -p 8080:8080
FROM ruby
# FROM debian-bash

RUN mkdir -p /root /client /server
ADD start.sh /root/
ADD client /client
ADD server /server

WORKDIR /server/

RUN \
wget http://www.dotdeb.org/dotdeb.gpg -O- | apt-key add - && \
wget http://nginx.org/keys/nginx_signing.key -O- | apt-key add - ; \
echo "deb http://nginx.org/packages/debian/ wheezy nginx" >> /etc/apt/sources.list && \
echo "deb-src http://nginx.org/packages/debian/ wheezy nginx" >> /etc/apt/sources.list && \
apt-get update && apt-get -y install \
nginx less nodejs; \
apt-get clean; \
rm -fr /etc/nginx; \
chmod u+x /root/start.sh; \
bundle install

ADD nginx /etc/nginx

EXPOSE 8080 80

CMD ["/root/start.sh"]
# CMD bash
