// it initializes based on JSON
// and can be queried with a set of (boro,block, (Lot IDs)
// for any relevant stories

class StoryIndex {
  contains(boro,block,lot) {
    return (this.storyMap.has(boro) && 
        this.storyMap.get(boro).has(block) &&
        this.storyMap.get(boro).get(block).has(lot))
  }

  story(boro,block,lot) {
    return this.storyMap.get(boro).get(block).get(lot).properties.text
  }

  constructor(json) {
    const storyMap = new Map()
    this.stories = json.features

    this.stories.forEach(function(val,i) {
      val.properties.id = i;
    })

    for (let feature of this.stories) {
      const bbl = feature.properties.bbl
      const boro = bbl[0]
      const block = bbl[1]
      const lot = bbl[2]
      if (!storyMap.has(boro)) {
        storyMap.set(boro,new Map())
      }
      if(!storyMap.get(boro).has(block)) {
        storyMap.get(boro).set(block,new Map())
      }
      storyMap.get(boro).get(block).set(lot,feature)
    }
    this.storyMap = storyMap
  }
}

export {StoryIndex}
