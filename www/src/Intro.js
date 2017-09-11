import React from 'react';
import './Intro.css'

class Intro extends React.Component {
  render() {
    return (
      <div id="introContainer" onClick={this.props.dismissIntro}>
        <div id="intro">
          <h1>80s.NYC</h1>
          <h2>STREET VIEW OF 1980s NEW YORK</h2>
          <img className="introStrip" src="/images/strip.jpg" alt=""></img>
          <p>Explore over 100,000 street segments
          and 800,000 building photos.</p>
          <p>Click near a highlighted segment to see the street,
      or select a featured <strong>story</strong> from the menu above.</p>
          <img className="introGif" src="/images/intro.gif" alt=""></img> 
          <a>START EXPLORING</a>
        </div>
      </div>
    );
  }
}

export {Intro}

