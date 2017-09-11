import React from 'react'
import {Stories} from './Stories.js'
import {About} from './About.js'
import {Filmstrip} from './Filmstrip.js'
import './Infostrip.css'

class Infostrip extends React.Component {

  render() {
    return (
      <div className="nogap">
        <div id="infostrip">
        { this.props.infoState === 'filmstrip' ? <Filmstrip
          setFocusedLot={this.props.setFocusedLot}
          focusedLot={this.props.focusedLot}
          storyIndex={this.props.storyIndex}
          filmstrip={this.props.filmstrip}
          closeInfostrip={this.props.closeInfostrip}
          /> : null }
        { this.props.infoState === 'about' ? <About
          closeInfostrip={this.props.closeInfostrip}
            /> : null }
        { this.props.infoState === 'stories' ? <Stories
          storyIndex={this.props.storyIndex}
          closeInfostrip={this.props.closeInfostrip}
          setMarkerViaLatLon={this.props.setMarkerViaLatLon}
          /> : null }
        </div>
      </div>
    )
  }
}

export {Infostrip}
