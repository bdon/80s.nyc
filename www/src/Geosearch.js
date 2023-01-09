import React from 'react'
import Autocomplete from 'react-autocomplete'

class Geosearch extends React.Component {

  state = {
    value: '',
    unitedStates: [],
  }

  requestTimer = null

  render() {
    return (
        <Autocomplete 
          wrapperProps={{'className':'dib mr3'}}
          inputProps={{ 'placeholder':'Search by address...','className':'bg-black input-reset w4 w5-l f6 ba b--dark-gray pa1 white'}}
          value={this.state.value}
          items={this.state.unitedStates}
          getItemValue={(item) => item.properties.label}
          onSelect={(value, item) => {
            this.setState({value: item.properties.label})
            var coords = item.geometry.coordinates
            this.props.onSelect(coords[1], coords[0])
          }}
          onChange={(event, value) => {
            var self = this
            self.setState({value: value})
            if (value.length < 3) return;
            if( self.requestTimer ) {
              clearTimeout(self.requestTimer)
            }
            self.requestTimer = setTimeout(function() {
                fetch('https://geosearch.planninglabs.nyc/v2/search?site=80s.nyc&text=' + value).then(function(response){
                  response.json().then(function(items) {
                      self.setState({unitedStates:items.features})
                  })
               })
            }, 500)
          }}
          renderMenu={children => (
            <div className="pa3 f5 z-999 absolute lh-copy bg-black">
              {children}
            </div>
          )}
          renderItem={(item, isHighlighted) => (
            <div
              className={`pa1 item ${isHighlighted ? 'bg-gray' : ''}`}
              key={item.properties.id}
            >{item.properties.label.replace(", New York, NY, USA","")}</div>
          )}
        />
    )
  }
}

export {Geosearch}
