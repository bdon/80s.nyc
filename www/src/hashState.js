class Hash {
  constructor(history) {
    this.history = history
		this.lastHash = null

		var parsed = this.parseHash(window.location.hash)
		if (parsed) {
      this.lastHash = window.location.hash
      this.lastParsed = parsed
		}
  }

  parseHash = (hash) => {
		if(hash.indexOf('#') === 0) {
			hash = hash.substr(1)
		}
    var filmstripOpen = false
		var args = hash.split("/");
    if (args[0] === 'show') {
      filmstripOpen = true
      args.shift()
    }
		if (args.length === 2) {
			const lat = parseFloat(args[0])
			const lon = parseFloat(args[1])
			if (isNaN(lat) || isNaN(lon)) {
				return false
			} else {
				return {
          center: {lat:lat, lng:lon},
          filmstripOpen: filmstripOpen
				};
			}
		} else {
			return false
		}
  }

  setMove = (filmstripOpen,targetLng,targetLat) => {
    var fs = filmstripOpen ? 'show/' : ''
    var hash = "#" + fs + [
      targetLat.toFixed(4),
      targetLng.toFixed(4)
    ].join("/")

		if (this.lastHash !== hash) {
      this.history.push(hash)
			this.lastHash = hash
		}
  }
}

export {Hash}
