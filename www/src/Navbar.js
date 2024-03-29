import React from 'react'
import {Geosearch} from './Geosearch.js'
import './hamburger.css'

class Navbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {noResults: false,menuOpen:false}
  }

  search = (e) => {
    const navbarComponent = this
    e.preventDefault()
    fetch('https://geosearch.planninglabs.nyc/v2/search?site=80s.nyc&text=' + this.inputref.value).then(function(response){
      response.json().then(function(val) {
        var geometry = val.features[0].geometry
        if (val.length === 0) {
          navbarComponent.setState({noResults:true})
        } else {
          navbarComponent.setState({noResults:false})
          navbarComponent.props.setMarkerViaLatLon(geometry.coordinates[1],geometry.coordinates[0])
        }
      })
    })
  }

  toggleHamburger = (e) => {
    this.setState({menuOpen:!this.state.menuOpen})
  }

  render() {
    return (
      <nav>
        <div className="pa3 flex items-center justify-between">
          <span className="mr3 f3 v-mid">80s.NYC</span>
          <span className="dn di-l gray mr3">STREET VIEW OF 1980S NEW YORK</span>
          <Geosearch onSelect={this.props.setMarkerViaLatLon}/>
          {this.state.noResults ? <span className="noresults">No results</span> : null }
          <span className="dn di-l">
            <span className="mr3 dim pointer" onClick={() => this.props.openStories()}>STORIES</span>
            <span className="mr3 dim pointer" onClick={() => this.props.openAbout()}>ABOUT</span>
            <span className="mr3 dim pointer" onClick={() => this.props.openTweet()}>SHARE ON TWITTER</span>
            <span className="dim pointer bg-dark-gray pv1 ph2"><a target="_blank" class="white" href="https://1940s.nyc">1940s</a></span>
          </span>
          <div className="dn-l">
            <button className={"pa0 fr hamburger hamburger--spin"+(this.state.menuOpen ? ' is-active':'')} type="button" onClick={this.toggleHamburger}>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
          </div>
        </div>
        { this.state.menuOpen ? 
        <div className="bg-black f4" key="navOptionsVertical">
          <div className="pa3 dim pointer" onClick={() => {this.props.openStories(); this.toggleHamburger()} }>STORIES</div>
          <div className="pa3 dim pointer" onClick={() => {this.props.openAbout(); this.toggleHamburger()} }>ABOUT</div>
          <div className="pa3 dim pointer" onClick={() => {this.props.openTweet(); this.toggleHamburger()} }>SHARE ON TWITTER</div>
          <div className="pa3 dim pointer bg-dark-gray"><a target="_blank" class="white" href="https://1940s.nyc">1940s</a></div>
        </div> : null }
      </nav>
    )
  }
}

export {Navbar}
