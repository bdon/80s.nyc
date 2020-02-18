/* global mapboxgl, turf */

import React from 'react'
import createHistory from 'history/createBrowserHistory'
//import {FILE_URL} from './Utils.js'
import {StoryIndex} from './StoryIndex.js'
import {Navbar} from './Navbar.js'
import {Infostrip} from './Infostrip.js'
import {Hash} from './hashState.js'
import {Intro} from './Intro.js'
import './hashState.js'
import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {filmstrip: null,infoState:null,focusedLot:null,storyIndex:null,viewPosition:null}
    this.hash = null
    this.history = null
  }

  updateUrl() {
    const vp = this.state.viewPosition
    if (vp) this.hash.setMove((this.state.infoState === "filmstrip"),vp.lng,vp.lat)
  }

  openFilmstrip(filmstrip,lot_id) {
    this.setState({filmstrip:filmstrip,infoState:"filmstrip",focusedLot:lot_id})
  }

  closeInfostripFunc = () => {
    this.setState({filmstrip:null,infoState:null})
    setTimeout(() => {this.map.resize() },350)
  }

  dismissIntro = () => {
    this.setState({showIntro: false})
  }

  openTweet = (e) => {
    window.open("https://twitter.com/intent/tweet?via=80snyc&url=http://80s.nyc/" + encodeURIComponent(window.location.hash),"height=600,width=600")
  }

  setMarkerViaLatLon = (lat,lon) => {
    this.map.jumpTo({center: [lon,lat]});
    const loadListener = () => {
      if (this.map.areTilesLoaded()) {
        this.map.off("sourcedata",loadListener)
        this.queryPoint(lon,lat)
      }
    }
    this.map.on("sourcedata", loadListener)
  }

  queryPoint = (lng,lat) => {
    const STORYMARKER_SIZE = 10
    const LOTQUERY_SIZE = 20
    var projected = this.map.project([lng,lat])
    var x = projected.x
    var y = projected.y
    var story_found = false

    var bbox = [[x - STORYMARKER_SIZE, y - STORYMARKER_SIZE], [x + STORYMARKER_SIZE, y + STORYMARKER_SIZE]]
    // check to see if we clicked a Story
    const stories = this.map.queryRenderedFeatures(bbox, { layers: ['stories'] })
    if (stories.length > 0) {
      story_found = true
      // opening a Story - clicked close to a story coordinate, so Snap to that exact story coordinate
      const story = stories[0]
      projected = this.map.project(story.geometry.coordinates)
      x = projected.x
      y = projected.y
      lng = story.geometry.coordinates[0]
      lat = story.geometry.coordinates[1]

      // clear yellow marker position
      this.map.getSource("viewPosition").setData({
        "type":"FeatureCollection",
        "features":[]
      })
      this.map.setFilter("stories-selected",["==","id",story.properties.id])

    } else {
      this.map.setFilter("stories-selected",["==","id",-1])
      // set yellow marker position
    }


    bbox = [[x - LOTQUERY_SIZE, y - LOTQUERY_SIZE], [x + LOTQUERY_SIZE, y + LOTQUERY_SIZE]]
    const closeFilmstrips = this.map.queryRenderedFeatures(bbox, { layers: ['filmstrips'] })
    if (closeFilmstrips.length === 0) return
    this.setState({viewPosition:{zoom:this.map.getZoom(),lng:lng,lat:lat}})
    if (!story_found) {
      this.map.getSource("viewPosition").setData({'type':"Point","coordinates":[lng,lat]})
    }
    const clickedPoint = { "type": "Point", "coordinates": [lng,lat] }
    const closestFilmstrip = closeFilmstrips.reduce((acc,filmstrip) => {
      const dist = turf.pointOnLine(filmstrip.geometry, clickedPoint).properties.dist
      return (dist < acc[1]) ? [filmstrip,dist] : acc
    },[null,Infinity])[0]
    const closestLotOnFilmstrip = this.map.querySourceFeatures('80snyc', {
      sourceLayer:'lotsndjson',
      filter:['==','fsid',closestFilmstrip.properties.id]
    }).reduce((acc,lot) => {
      const dist = turf.distance(turf.centroid(lot.geometry),clickedPoint)
      return (dist < acc[1]) ? [lot,dist] : acc
    },[null,Infinity])[0]
    this.openFilmstrip(closestFilmstrip,closestLotOnFilmstrip.properties.lot)
    this.map.setFilter("filmstrips-highlight", ['==',"id",closestFilmstrip.properties.id])
    
  }

  openStories = () => {
    if (this.state.infoState === "stories") {
      this.setState({infoState:null})
    } else {
      this.setState({infoState:'stories'})
    }
  }

  openAbout = () => {
    if (this.state.infoState === "about") {
      this.setState({infoState:null})
    } else {
      this.setState({infoState:'about'})
    }
  }

  componentDidUpdate() {
    this.updateUrl()
  }

  componentWillMount() {
    this.history = createHistory()
    this.hash = new Hash(this.history)
    if (this.hash.lastParsed && this.hash.lastParsed.filmstripOpen) {
      this.setState({infoState:"filmstrip",showIntro:false})
    } else {
      this.setState({showIntro:true})
    }
  }

  componentDidMount() {
    var startingCenter = undefined
    var startingZoom = undefined
    if (this.hash.lastHash == null) {
      startingCenter = [-73.99356365203857,40.69664826715394]
      startingZoom = 14
    } else {
      var lastParsed = this.hash.lastParsed
      startingCenter = [lastParsed.center.lng,lastParsed.center.lat]
      startingZoom = 14
    }
    var map = new mapboxgl.Map({
        container: 'mapid',
        style: 'style.json',
        maxZoom:18,
        minZoom:9,
        maxBounds:[[-75.9, 40.0],[-72.4, 42.0]],
        center:startingCenter,
        zoom:startingZoom
    })
    map.addControl(new mapboxgl.NavigationControl())
    this.map = map
    if (this.hash.lastParsed && this.hash.lastParsed.filmstripOpen) {
      this.map.on("load", () => {
        this.setMarkerViaLatLon(this.hash.lastParsed.center.lat,this.hash.lastParsed.center.lng)
      })
    }
    
    this.map.on('click', (e) => {
      if (this.map.getZoom() < 14) {
        this.map.flyTo({center: e.lngLat, zoom:14})
      } else {
        //console.log([e.lngLat.lng,e.lngLat.lat])
        this.queryPoint(e.lngLat.lng,e.lngLat.lat)
      }
    })

    this.map.on("load", () => {
      fetch('/stories.json').then((response) => {
        response.json().then((val) => {
          this.setState({storyIndex:new StoryIndex(val)})
          this.map.getSource("stories").setData(val)
        })
      })
    })
  }

  render() {
    return (
      <div className="app-root avenir">
        <Navbar key="navbar"
          showInfostrip={this.state.infoState != null} 
          openStories={this.openStories}
          openAbout={this.openAbout}
          openTweet={this.openTweet}
          setMarkerViaLatLon={this.setMarkerViaLatLon}
        />
        { this.state.infoState != null ? <Infostrip 
          infoState={this.state.infoState}
          closeInfostrip={this.closeInfostripFunc}
          setMarkerViaLatLon={this.setMarkerViaLatLon}
          filmstrip={this.state.filmstrip}
          focusedLot={this.state.focusedLot}
          storyIndex={this.state.storyIndex}
        /> : null }
        <div className="mapContainer">
          <div id="mapid"/>
          { this.state.showIntro ? 
            <Intro dismissIntro={this.dismissIntro}/>
            : null }
        </div>
      </div>
    )
  }
}

export {App, Navbar}
