import React from 'react';
import {imageUrl} from './Utils.js'
import './Stories.css'

class Stories extends React.Component {
  openStory = (story) => {
    const coords = story.geometry.coordinates
    this.props.setMarkerViaLatLon(coords[1],coords[0])
  }

  render() {
    const storiesComponent = this
    function StoryList(props) {
      const stories = props.stories.map(function(story) {
        const bbl = story.properties.bbl
        const imgsrc = imageUrl(bbl[0],bbl[1],bbl[2])
        return (<div className="storyImage" key={story.properties.id}>
          <img src={imgsrc} alt={story.properties.id} onClick={() => storiesComponent.openStory(story)}/>
          </div>)
      })

      return (<div className="storiesContainer">{stories}</div>)
    }

    return (
      <div id="stories">
        <h2>CLICK A PHOTO TO VIEW ITS STORY.</h2>
        { this.props.storyIndex ? <StoryList 
          stories={this.props.storyIndex.stories} 
          /> : 'Stories not yet loaded.' }
        <div className="streetTitle" onClick={() => this.props.closeInfostrip()}>
          <span className="closeButton">
            <img src='/images/closeButton.svg' alt="close"></img>            
          </span>
        </div>
      </div>
    );
  }
}

export {Stories};
