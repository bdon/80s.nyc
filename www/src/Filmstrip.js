import React from 'react'
import {imageUrl} from './Utils.js'
import './Filmstrip.css'

class Filmstrip extends React.Component {
  constructor(props) {
    super(props)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.animatorFunc = this.animatorFunc.bind(this)
  }

  componentDidUpdate(prevProps,prevState) {
    if (this.props.filmstrip) {
      if (prevProps.filmstrip !== this.props.filmstrip) {
        setTimeout(() => { this.setScrollPosition(this.props.filmstrip,this.props.focusedLot,false) },300) // hacky
      } else {
        this.setScrollPosition(this.props.filmstrip,this.props.focusedLot,true)  
      }
    }
  }

  setScrollPosition(filmstrip,focusedLot,animated) {
    const boro = filmstrip.properties.boro
    const block = filmstrip.properties.block
    const imgdiv = this.fsref.getElementsByClassName("lotPhoto-" + boro + '-' + block + '-' + focusedLot)[0]
    const l = imgdiv.getBoundingClientRect().left + this.fsref.scrollLeft
    this.desiredScroll = l - this.fsref.clientWidth / 2
    if (animated) {
      clearInterval(this.animator)
      this.animator = setInterval(this.animatorFunc,30)
    } else {
      this.fsref.scrollLeft = this.desiredScroll
    }
  }

  animatorFunc() {
    if (Math.abs(this.fsref.scrollLeft - this.desiredScroll) < 5 || this.lastScrollLeft === this.fsref.scrollLeft) {
      clearInterval(this.animator)
    }
    this.lastScrollLeft = this.fsref.scrollLeft
    this.fsref.scrollLeft += (this.desiredScroll - this.fsref.scrollLeft) / 5.0
  }

  onMouseDown(e) {
    this.dragging = true
    this.lastClientX = e.clientX
  }
  onMouseUp(e) {
    this.dragging = false
  }

  onMouseMove(e) {
    if (this.dragging) {
      this.fsref.scrollLeft -= (e.clientX - this.lastClientX)
      this.lastClientX = e.clientX
    }
  }

  render() {
    const fsComponent = this

    function StreetTitle(props) {
      const fprops = props.filmstrip.properties
      return (<div className='streetTitle' onClick={() => props.closeInfostrip()}>
           <span className="streetTitleMain">{fprops.sname}</span>
          { fprops.lname && fprops.rname ?
            <span className="streetTitleExtra"> between {fprops.lname} and {fprops.rname}</span> : null
          }
          <span className="closeButton">
            <img src='/images/closeButton.svg' alt="close"></img>            
          </span>
        </div>)
    }

    function ImageList(props) {
      const boro = props.filmstrip.properties.boro
      const block = props.filmstrip.properties.block
      const lots = JSON.parse(props.filmstrip.properties.lots)
      const images = lots.map(function(lot) {
        const className = "imageContainer lotPhoto-" + boro + '-' + block + '-' +lot.lot_id
        if (lot.photo) {
          const iUrl = imageUrl(boro,block,lot.lot_id)
          const tooltip = "boro " + boro + " block " + block + " lot " + lot.lot_id
          return (<div className={className} key={boro + '-' + block + '-' + lot.lot_id}>
            { props.storyIndex && props.storyIndex.contains(boro,block,lot.lot_id) ?
              <div className="storyFrame">
                <div className="storyHeader">
                <span className="storyTitle">STORY</span>
                <span className="storyArrow">▶</span>
                </div>
                {props.storyIndex.story(boro,block,lot.lot_id)}
              </div>
              : null
            }
            <img src={iUrl} alt={tooltip} title={tooltip} className="image"/>
            { props.focusedLot === lot.lot_id ? 
              <span className="pulse"></span>
              : null
            }
          </div>)
        } else {
          return (<div className={className} key={boro + '-' + block + '-' + lot.lot_id}>
            <img src="/images/missing_image.jpg" alt="" height="400px" className="missingImage"/>
            { props.focusedLot === lot.lot_id ? 
              <span className="pulse"></span>
              : null
            }
          </div>)
        }
      })

      return (
        <div 
          className="filmstripStretch" 
          onMouseDown={fsComponent.onMouseDown}
          onMouseMove={fsComponent.onMouseMove}
          onMouseUp={fsComponent.onMouseUp}
          onMouseLeave={fsComponent.onMouseUp}
        >
        {images}
        </div>
      )
    }

    return (
      <div>
        <div className="filmstrip" ref={(fsref) => { this.fsref = fsref }}>
          { this.props.filmstrip ? <ImageList 
              filmstrip={this.props.filmstrip} 
              focusedLot={this.props.focusedLot} 
              storyIndex={this.props.storyIndex}
            /> : null }
        </div>
        { this.props.filmstrip ? <StreetTitle filmstrip={this.props.filmstrip} closeInfostrip={this.props.closeInfostrip}/> : null }
      </div>
    )
  }
}

export {Filmstrip}
