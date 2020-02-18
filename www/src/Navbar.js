import React from 'react'
import {Geosearch} from './Geosearch.js'
import './Navbar.css'
import './hamburger.css'

class Navbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {noResults: false,menuOpen:false}
  }

  search = (e) => {
    const navbarComponent = this
    e.preventDefault()
    fetch('https://geosearch.planninglabs.nyc/v1/search?site=80s.nyc&text=' + this.inputref.value).then(function(response){
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
    const clsnames = (this.props.showInfostrip ? ' navbarsmall' : ' navbarbig')
    return (
      <nav className={clsnames}>
        <div className="pa3">
          <span className="mr3 f3">80s.NYC</span>
          <span className="subTitle gray mr3">STREET VIEW OF 1980S NEW YORK</span>
          <Geosearch onSelect={this.props.setMarkerViaLatLon}/>
          {this.state.noResults ? <span className="noresults">No results</span> : null }
          <div className="navOptionsHorizontal">
            <span className="mr3" onClick={() => this.props.openStories()}>STORIES</span>
            <span className="mr3" onClick={() => this.props.openAbout()}>ABOUT</span>
            <span className="" onClick={() => this.props.openTweet()}>SHARE ON TWITTER</span>
          </div>
          <button className={"hamburger hamburger--spin"+(this.state.menuOpen ? ' is-active':'')} type="button" onClick={this.toggleHamburger}>
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
        </div>
        { this.state.menuOpen ? 
        <div className="navOptionsVertical bg-black f4" key="navOptionsVertical">
          <div className="pa3" onClick={() => {this.props.openStories(); this.toggleHamburger()} }>STORIES</div>
          <div className="pa3" onClick={() => {this.props.openAbout(); this.toggleHamburger()} }>ABOUT</div>
        </div> : null }
      </nav>
    )
  }
}

export {Navbar}
