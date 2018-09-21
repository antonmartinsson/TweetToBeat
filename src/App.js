/* global Demo, React, ReactDOM */

/**
 * (C) 2017 Spotify AB
 */
    
/********************************
 ********************************
 ******** REACT CLASSES *********
 ********************************
 ********************************/

var Authorize = React.createClass({
  render () {
    return (
      <div className="screen">        
        <button className="btn btn-lg btn-primary" onClick={Demo.sendToLogin}>Log in with Spotify</button>
      </div>
    );
  }
});

var ConnectPlayer = React.createClass({
  listenForFocusOnWebPlayer() {
    let _this = this;
    let stateHandlerCallback = (state) => {
      _this.stateHandler(state);
    };
    
    // Call once when connected
    Demo.WebPlaybackSDK.getCurrentState().then(stateHandlerCallback);

    // When a change is made
    Demo.WebPlaybackSDK.on("player_state_changed", stateHandlerCallback);

    // Poll status every 0.1 seconds
    // This is just to improve the UI for the progress bar
    setInterval(() => {
      Demo.WebPlaybackSDK.getCurrentState().then(stateHandlerCallback);      
    }, 100);
  },
  waitingToStart() {
    let player_name = Demo.WebPlaybackSDK._options.name;

    return (
      <div className="screen screen-connect-player">
        <div className="icon grid-loading-icon">
          <span className="visually-hidden">Loading</span>
        </div>
        <br />
        <h1>Select <span className="spotify-green">{player_name}</span> on Spotify Connect ...</h1>
      </div>
    );
  },
  stateHandler(state) {
    if (state === null) {
      ReactDOM.render(this.waitingToStart(), document.getElementById('screen'));
    } else {
      ReactDOM.render(
        <Player state={state} />,
        document.getElementById('screen')
      );
    }
  },
  render() {
    this.listenForFocusOnWebPlayer(); // Start waiting to hear back from Demo.WebPlaybackSDK
    Demo.transferPlayback();          // Transfer playback to SDK (via Connect Web API over HTTP)
    return this.waitingToStart();     // Render a waiting screen
  }
});

var PlayerError = React.createClass({
  render () {
    return (
      <div className="screen screen-error">
        <div className="alert alert-danger">
          <h3>{this.props.heading}</h3>
          <p>{this.props.message}</p>
        </div>
      </div>
    );
  }
});

var Player = React.createClass({
  getInitialState: function() {
        return { showResults: 0 };
    },
  displayPresDiv: function (indx) {
        this.setState({showResults: indx});
    },
  geturi: function() {
      var inputF = document.getElementById("inputV").value;
      console.log("LOG" + inputF);
      var promiseB = Demo.getTweetTrack(inputF).then(function(result) {
      Demo.playTrack(result.uri);
      document.getElementById("userImg").src = result.imageUrl;
      console.log(result.imageUrl);
      var keyWord = result.keyWord.charAt(0).toUpperCase() + result.keyWord.slice(1);
      if(result.notValidUser) {document.getElementById("userName").innerHTML = "@" + '<b className="modd">' + inputF + "</b>" + " does not exist"}
      else if(result.notValidWord) {
        if(result.keyWord =='') {
          document.getElementById("userName").innerHTML = "@" + '<b className="modd">' + inputF + "</b>" + " has not tweeted any interesting words";}
        else {
          document.getElementById("userName").innerHTML = "@" + '<b className="modd">' + inputF + "</b>" + "<br/>Most tweeted word:" + "<br/> <b>" + keyWord + "</b>" + "<br/>No matching songs"}}
      else {
      document.getElementById("userName").innerHTML = "@" + '<b class="modd">' + inputF + "</b>" + "<br/>Most tweeted word:" + "<br/><b>'" + keyWord + "'</b>";}
      document.getElementById("tweetDiv").style.display = "block";
      document.getElementById("playerDiv").style.display = "block";
      console.log(result.keyWord);
      });
      
      
  },
  current_track() {
    return this.props.state.track_window.current_track;
  },
  render() {
    let track = this.current_track();
    let image = track.album.images[2];
    let searchResults;

    return (
      <div className="screen screen-player">
        <div className="player">
          <div className="row">
                <input className="inputFieldStyle" type="text" name="inputV" id="inputV" />
                <button className="btn btn-lg btn-primary" onClick={() => this.geturi()} >BEAT!</button> 
                
          <div className="mod">
  
            <div className="col-sm-4"id="tweetDiv">
              <img id="userImg" src="" alt=""/>
                <div id="userName"></div>

            </div>
             
            <div className="col-sm-8" id="playerDiv">                        
              <div>
                <div className="wrapperOut">
                  <PlayerAlbumArt image_url={image.url} />            
                  <div>         
                    <PlayerTrack track={track} />
                    <PlayerArtists artists={track.artists} />
                    <h4>{track.album.name}</h4>
                      
                    <PlayerProgress state={this.props.state} showPosition={true} showDuration={true} />
                  </div>    
                </div>            
                    
            </div>      
                              
          </div>  
                               
            </div>
            
          </div>
        </div>

      
      </div>
    );
  }
});

var PlayerProgress = React.createClass({
  parseTime (seconds) {
    seconds = seconds / 1000;
    return [
        parseInt(seconds / 60 % 60),
        parseInt(seconds % 60)
    ].join(":").replace(/\b(\d)\b/g, "0$1");
  },
  renderPosition () {
    if (this.props.showPosition === true) {
      return (<span className="position">{this.parseTime(this.props.state.position)}</span>);
    } else {
      return null;
    }    
  },
  renderDuration () {
    if (this.props.showDuration === true) {
      return (<span className="duration">{this.parseTime(this.props.state.duration)}</span>);
    } else {
      return null;
    }
  },
  render () {
    let progress_perc    = (this.props.state.position / this.props.state.duration) * 100;
    let styles           = {'width': progress_perc + '%'};

    return (
      <div className="player player-progress">
        {this.renderPosition()}
        <span className="progress-bar" style={styles}></span>
        {this.renderDuration()}
      </div>
    );
  }
});

var PlayerAlbumArt = React.createClass({
  getInitialState: function() {
        return { check: true };
    },
  
  resume() {
    this.setState({check: true});
    Demo.WebPlaybackSDK.resume();
  },
  pause() {
    this.setState({check: false});
    Demo.WebPlaybackSDK.pause();
  },
  play() {this.state.check ? this.pause() : this.resume()},
  render () {
    return (
      <div className="player player-album-art" >
        <img src={this.props.image_url} onClick={() => this.play()}/>
      </div>
    );
  }
});



var PlayerTrack = React.createClass({
  parseTrackName () {
    return this.props.track.name.split("(feat")[0];
  },
  render () {
    return (<h1 className="player player-track">{this.parseTrackName()}</h1>);
  }
});

var PlayerArtists = React.createClass({
  renderArtists () {
    return this.props.artists.map((artist) => {
      return (<li>{artist.name}</li>);
    });
  },
  render () {
    return (<ul className="player player-artists">{this.renderArtists()}</ul>);
  }
});

var PlayerControls = React.createClass({
  
  resume() {
    Demo.WebPlaybackSDK.resume();
  },
  pause() {
    Demo.WebPlaybackSDK.pause();
  },
  renderPlayOrPause() {
    if (this.props.state.paused === true) {
      return (<li><a onClick={this.resume} className="fa fa-play"></a></li>);
    } else {
      return (<li><a onClick={this.pause} className="fa fa-pause"></a></li>);      
    }
  },
  render () {
    let track_id = this.props.state.track_window.current_track.id;
    let track_url = "https://open.spotify.com/track/" + track_id;
    
    return (
      <div>
      <ul className="player player-controls">   
        {this.renderPlayOrPause()}  
      </ul>
     </div>
                                       
    );
  }
});

var PlayerBackgroundAlbumArt = React.createClass({
  render() {
    let style = {
      backgroundImage: `url("https://cdn.glitch.com/5e7de7dd-26ae-45f7-b0e9-78a09878cb0d%2FDesktop%20HD%20Copy.jpg?1511086505280")`,   
      backgroundPosition: 'center center'
    };

    return (<div className="screen screen-player-album-art" style={style}></div>);
  }
});
    

    
/********************************
 ********************************
 **** RENDER OUR APPLICATION ****
 ********************************
 ********************************/

if (Demo.isAccessToken() === false) {
  ReactDOM.render(<Authorize />, document.getElementById('screen'));
}

Demo.onSpotifyPlayerConnected = (data) => {
  ReactDOM.render(<ConnectPlayer />, document.getElementById('screen'));
};

Demo.onSpotifyUserSessionExpires = () => {
  Demo.WebPlaybackSDK.disconnect(); // Disconnect the player

  ReactDOM.render(
    <div>
      <PlayerError
        heading="Session expired."
        message="Playback sessions only last 60 minutes. Refresh for new session." />
      <Authorize />
    </div>,
    document.getElementById('screen')
  );
};

Demo.renderWebPlaybackSDKError = (title, e) => {
  ReactDOM.render(
    <PlayerError heading={title} message={e} />,
    document.getElementById('screen')
  );
};
