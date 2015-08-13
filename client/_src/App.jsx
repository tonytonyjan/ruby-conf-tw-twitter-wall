var configUrl = '/config.json';
var tweet_cnt = 0;

const Tweet = React.createClass({
  getInitialState() {
    return {imgReady: false,addedDate: new Date()};
  },
  imgReady() {
    console.debug(`#${this.props.id} tweet image ready.`);
    var tweetWrapper = React.findDOMNode(this.refs.tweetWrapper);
    if(tweetWrapper) tweetWrapper.classList.add("done");
  },
  componentDidMount() {
    console.debug(`#${this.props.id} tweet added.`);
    var img = new Image;
    img.onload = this.imgReady;
    img.src = this.props.user.profile_image_url;
  },
  render() {
    var tweetWrapperClass = "tweet"
    if(this.state.imgReady) tweetWrapperClass += " done";
    return (
      <div ref="tweetWrapper" className={tweetWrapperClass}>
        <div className="media well">
          <a className="pull-left" href="#">
            <img ref="img" className="media-object" src={this.props.user.profile_image_url} />
          </a>
          <div className="media-body">
            <h2 className="media-heading">{this.props.user.screen_name} <small className="timeago" title={this.props.created_at}></small></h2>
            <h3>{this.props.text}</h3>
            <TimeAgo date={ this.state.addedDate } />
          </div>
        </div>
      </div>
    );
  }
});

const App = React.createClass({
  getInitialState() {
    return {tweets: [],config: null,initPercent:0,msg:""};
  },
  componentDidMount() {
    var req = new XMLHttpRequest();
    req.open("GET", configUrl, true);

    req.addEventListener("progress", this.initUpdateProgress, false);
    req.onload = this.initOK;

    req.send();
    this.setState({msg: "Asking for config.json ..."});
  },
  initUpdateProgress(oEvent) {
    var newInitPercent;
    if (oEvent.lengthComputable) {
      newInitPercent = ( oEvent.loaded / oEvent.total ) * 100;
    } else {
      newInitPercent = 99.9;
    }
    // console.log(newInitPercent);
    this.setState({ initPercent:newInitPercent,msg:`Asking for config.json ... ${newInitPercent}%` });
  },
  initOK(evt) {
    var self = this;
    setTimeout(() => {
      self.setState({ initPercent:100, config: JSON.parse(evt.target.responseText) });
      self.startWs();

    },1000);
  },
  startWs(){
    var sock = new WebSocket(this.state.config.server);
    sock.onmessage = this.wsRcv;
    sock.onclose = this.loseWs;
    this.setState({ msg:"Connecting Websocket ..." });
  },
  wsRcv(evt) {
    var d = JSON.parse(evt.data);
    // console.debug(d);
    switch(d.op){
      case 'msg':
        this.setState({msg:d.data});
        break;
      case 'tweet':
        var newTweet = this.state.tweets;
        d.data.id = tweet_cnt++;
        newTweet.splice(0,0,d.data);
        if(newTweet.length > 10) newTweet.splice(10,1);
        this.setState({tweets: newTweet});
        break;
      default:
        console.error(evt);
    }
  },
  loseWs(e) {
    console.warn(e)
    setTimeout(this.startWs,5000);
    this.setState({ msg:"Connection lost, Retry after 5 seconds" });
  },

  //////////////////

  render() {
    return (
      <div>
        <div className="container-fluid header">
          <h3>{this.state.msg}</h3>
        </div>
        <div className="spliter"></div>
        <div className="container">
          {
            _.map(this.state.tweets,(ele) => {
              return (
                <Tweet key={ele.id} id={ele.id} user={ele.user} created_at={ele.created_at} text={ele.text} />
              )
            })
          }
        </div>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('main'));
