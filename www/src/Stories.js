import React from 'react';
import {imageUrl} from './Utils.js'

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
        return (<div className="dib" key={story.properties.id}>
          <img className="h5 mr2 mb2 dim pointer" src={imgsrc} alt={story.properties.id} onClick={() => storiesComponent.openStory(story)}/>
          </div>)
      })

      return (<div className="overflow-y-scroll">{stories}</div>)
    }

    return (
      <div className="ws-normal w-100">
        <div className="pa3 f2">Click a photo to view its story.</div>
        { this.props.storyIndex ? <StoryList 
          stories={this.props.storyIndex.stories} 
          /> : 'Stories not yet loaded.' }
        <div className="pa3" onClick={() => this.props.closeInfostrip()}>
          <span className="dark-gray">STORIES</span>
          <span className="fr dim pointer">CLOSE</span>
        </div>
      </div>
    );
  }
}

export {Stories};
