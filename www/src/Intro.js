import React from 'react';

class Intro extends React.Component {
  render() {
    return (
      <div className="vh-100 flex z-9999 fixed top-0 bottom-0 left-0 right-0" style={{backgroundColor:"rgba(0,0,0,0.3)"}} onClick={this.props.dismissIntro}>
        <div className="flex items-center justify-center w-100 f6 f5-l"> 
          <div className="pa3 mw6 tc lh-copy bg-near-black"  onClick={(e) => {e.stopPropagation()}}>
            <div className="f2">80s.NYC</div>
            <div className="f4 mt3">STREET VIEW OF 1980s NEW YORK</div>
            <img className="introStrip mt3" src="/images/strip.jpg" alt=""></img>
            <p>Explore over 100,000 street segments
            and 800,000 building photos.</p>
            <p>Click near a highlighted segment to see the street,
        or select a featured <strong>story</strong> from the menu above.</p>
            <div><video src="/instructions.mp4" type="video/mp4" controls={true} muted={true} width="240"></video></div>
            <div className="f4 mt3 bg-dark-gray dim pointer" onClick={this.props.dismissIntro}>START EXPLORING</div>
          </div>
        </div>
      </div>
    );
  }
}

export {Intro}

