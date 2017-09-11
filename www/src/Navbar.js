import React from 'react'
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
    fetch('http://nominatim.openstreetmap.org/search?format=json&viewbox=-73.7,40.5,-74.3,40.9&bounded=1&q=' + this.inputref.value).then(function(response){
      response.json().then(function(val) {
        if (val.length === 0) {
          navbarComponent.setState({noResults:true})
        } else {
          navbarComponent.setState({noResults:false})
          navbarComponent.props.setMarkerViaLatLon(parseFloat(val[0].lat),parseFloat(val[0].lon))
        }
      })
    })
  }

  toggleHamburger = (e) => {
    this.setState({menuOpen:!this.state.menuOpen})
  }

  render() {
    const clsname = this.props.showInfostrip ? 'navbarsmall' : 'navbarbig'
    return (
      <nav className={clsname}>
        <span className="mainTitle">80s.NYC</span>
        <span className="subTitle">STREET VIEW OF 1980S NEW YORK</span>
        <form onSubmit={this.search} className="locationSearch">
          <input ref={(input) => { this.inputref = input }} placeholder="Search..."/>
        </form>
        {this.state.noResults ? <span className="noresults">No results</span> : null }
        <div className="navOptionsHorizontal">
          <span onClick={() => this.props.openStories()}>STORIES</span>
          <span onClick={() => this.props.openAbout()}>ABOUT</span>
          <span className="shareOnTwitter" onClick={() => this.props.openTweet()}>SHARE ON TWITTER</span>
        </div>
        <button className={"hamburger hamburger--spin"+(this.state.menuOpen ? ' is-active':'')} type="button" onClick={this.toggleHamburger}>
          <span className="hamburger-box">
            <span className="hamburger-inner"></span>
          </span>
        </button>
        { this.state.menuOpen ? 
        <div className="navOptionsVertical" key="navOptionsVertical">
          <div onClick={() => {this.props.openStories(); this.toggleHamburger()} }>STORIES</div>
          <div onClick={() => {this.props.openAbout(); this.toggleHamburger()} }>ABOUT</div>
        </div> : null }
      </nav>
    )
  }
}

export {Navbar}
