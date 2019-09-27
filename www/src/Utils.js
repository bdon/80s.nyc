const FILE_URL = process.env.REACT_APP_FILE_URL || "https://80s-nyc.nyc3.digitaloceanspaces.com"

function cartesianDistance(x0,y0,x1,y1) {
  const a = x0 - x1
  const b = y0 - y1
  return Math.sqrt(a*a+b*b)
}

function pad(n, width, z) {
  z = z || '0'
  n += ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

function imageUrl(boro,block,lot) {
  const block_padded = pad(block, 5)
  const lot_padded = pad(lot, 4)
  return FILE_URL +"/photos/" + boro + "/" + block_padded + "/" + lot_padded + ".jpg"
}

export {cartesianDistance, imageUrl, FILE_URL}
