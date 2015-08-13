"use strict";

var configUrl = '/config.json';
var tweet_cnt = 0;

var Tweet = React.createClass({
  displayName: "Tweet",

  getInitialState: function getInitialState() {
    return { imgReady: false, addedDate: new Date() };
  },
  showImg: function showImg() {
    this.setState({ imgReady: true });
    console.debug("#" + this.props.id + " tweet image showed.");
  },
  imgReady: function imgReady() {
    setTimeout(this.showImg, 500);
    console.debug("#" + this.props.id + " tweet image ready.");
  },
  componentDidMount: function componentDidMount() {
    console.debug("#" + this.props.id + " tweet added.");
    var img = new Image();
    img.onload = this.imgReady;
    img.src = this.props.user.profile_image_url;
  },
  render: function render() {
    var tweetWrapperClass = "tweet";
    if (this.state.imgReady) tweetWrapperClass += " done";
    return React.createElement(
      "div",
      { ref: "tweetWrapper", className: tweetWrapperClass },
      React.createElement(
        "div",
        { className: "media well" },
        React.createElement(
          "a",
          { className: "pull-left", href: "#" },
          React.createElement("img", { ref: "img", className: "media-object", src: this.props.user.profile_image_url })
        ),
        React.createElement(
          "div",
          { className: "media-body" },
          React.createElement(
            "h2",
            { className: "media-heading" },
            this.props.user.screen_name,
            " ",
            React.createElement("small", { className: "timeago", title: this.props.created_at })
          ),
          React.createElement(
            "h3",
            null,
            this.props.text
          ),
          React.createElement(TimeAgo, { date: this.state.addedDate })
        )
      )
    );
  }
});

var App = React.createClass({
  displayName: "App",

  getInitialState: function getInitialState() {
    return { tweets: [], config: null, initPercent: 0, msg: "" };
  },
  componentDidMount: function componentDidMount() {
    var req = new XMLHttpRequest();
    req.open("GET", configUrl, true);

    req.addEventListener("progress", this.initUpdateProgress, false);
    req.onload = this.initOK;

    req.send();
    this.setState({ msg: "Asking for config.json ..." });
  },
  initUpdateProgress: function initUpdateProgress(oEvent) {
    var newInitPercent;
    if (oEvent.lengthComputable) {
      newInitPercent = oEvent.loaded / oEvent.total * 100;
    } else {
      newInitPercent = 99.9;
    }
    // console.log(newInitPercent);
    this.setState({ initPercent: newInitPercent, msg: "Asking for config.json ... " + newInitPercent + "%" });
  },
  initOK: function initOK(evt) {
    var self = this;
    setTimeout(function () {
      self.setState({ initPercent: 100, config: JSON.parse(evt.target.responseText) });
      self.startWs();
    }, 1000);
  },
  startWs: function startWs() {
    var sock = new WebSocket(this.state.config.server);
    sock.onmessage = this.wsRcv;
    sock.onclose = this.loseWs;
    this.setState({ msg: "Connecting Websocket ..." });
  },
  wsRcv: function wsRcv(evt) {
    var d = JSON.parse(evt.data);
    // console.debug(d);
    switch (d.op) {
      case 'msg':
        this.setState({ msg: d.data });
        break;
      case 'tweet':
        var newTweet = this.state.tweets;
        d.data.id = tweet_cnt++;
        newTweet.splice(0, 0, d.data);
        if (newTweet.length > this.state.config.max_tweet) newTweet.splice(this.state.config.max_tweet, 1);
        this.setState({ tweets: newTweet });
        break;
      default:
        console.error(evt);
    }
  },
  loseWs: function loseWs(e) {
    console.warn(e);
    setTimeout(this.startWs, 5000);
    this.setState({ msg: "Connection lost, Retry after 5 seconds" });
  },

  //////////////////

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "container-fluid header" },
        React.createElement(
          "h3",
          null,
          this.state.msg
        )
      ),
      React.createElement("div", { className: "spliter" }),
      React.createElement(
        "div",
        { className: "container" },
        _.map(this.state.tweets, function (ele) {
          return React.createElement(Tweet, { key: ele.id, id: ele.id, user: ele.user, created_at: ele.created_at, text: ele.text });
        })
      )
    );
  }
});

React.render(React.createElement(App, null), document.getElementById('main'));