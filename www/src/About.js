import React from 'react';

class About extends React.Component {
  render() {
    return (
      <div id="about" className="pa3 lh-copy">
        <h2>ABOUT</h2>
        <p>
          80s.nyc is a map-based full street view of 1980s New York City, organizing photographs from the New York City Municipal Archives’ Department of Finance Collection into an easy-to-browse glimpse of the streetscape 30 years ago. 
        </p>
        <h3>
          WHERE DO THESE PHOTOS COME FROM?
        </h3>
        <p>
          During the mid-1980s, the City of New York photographed every property in the five boroughs. The project had a bureaucratic origin: the photos were used by the Department of Finance to estimate real property values for taxation purposes. Buildings as well as vacant lots were photographed because both are taxed. Because it was difficult to distinguish while shooting between taxable and tax-exempt buildings, like religious institutions or government offices, the photographers just shot everything. The result is a remarkable body of imagery – over 800,000 color 35mm photos in both negative and print formats. 
        </p>
        <h3>
          DO PHOTO SETS FROM OTHER DECADES EXIST?
        </h3>
        <p>
          Yes! At the end of the 1930s into the early 1940s, coordinated by the Federal Works Progress Administration, the City created its first set of “tax photos” – at that time, over 700,000 black & white 35mm photos of almost every building in New York. In some respects, this earlier photo set is more historically interesting – twice as old, and before the post-war construction boom (aided and abetted by Robert Moses) remade large swaths of the city.
        </p>
        <p>
          However, only the 1980s photo set has been digitized. 
        </p>
        <p>
          Because the Department of Finance originally recorded each 1980s print as one frame on Laser Video Disks (LVDs), using analog video capture, the low-resolution images were able to be extracted for the Municipal Archives online gallery. Both sets have made their way from proprietary use by the Finance Department to the City’s Municipal Archives in recent years. The Municipal Archives makes the 1980s photo set available for public viewing on <a href="http://nycma.lunaimaging.com/luna/servlet">its imagery website</a>.
        </p>
        <p>
          The Archives will be digitizing the 1940s photos in 2018. You can buy high-quality prints of the 1940s and 1980s photos via the "Order Online" link on <a href="https://www1.nyc.gov/dorforms/photoform.htm">the Municipal Archives website.</a>
        </p>
        <h3>
          WHY ARE THESE PHOTOS SO SMALL/GRAINY?
        </h3>
        <p>
          The Finance Department recorded each 1980s print as one frame on Laser Video Disks (LVDs), using analog video capture. When the Archives obtained possession of the photo set, they extracted low-resolution TIFF files of each LVD frame. This site uses the low-res JPG thumbnails of these TIFFs.
        </p>
        <p>
          The underlying photos of individual buildings represented by these thumbnails won’t win any prizes for technical merit. They’re small, grainy, washed out and often the buildings might be unrecognizable. Still, taken as a whole, the thumbnails paint a distinctive picture of New York City in the 1980s – in many places, recovering from near-bankruptcy in the prior decade which left hulks of burned-out buildings and garbage-strewn lots; in other places, hanging on to the grandeur and glory of the greatest city in the world.
        </p>
        <h3>
          WHAT’S THE POINT OF 80S.NYC?
        </h3>
        <p>
          The city-owned imagery is publicly viewable on the New York City Municipal Archives website but the viewing format is limited. The default organizing principle there is the city’s Borough-Block-Lot (BBL) numbering scheme, which alone or together with address searching, is useful for retrieving images of individual buildings. There is no map-based search like 80s.nyc has. The street view-style presentation of 80s.nyc also provides block and neighborhood context that’s missing from a building-by-building view.
        </p>
        <h3>
          WHAT ARE STORIES?
        </h3>
        <p>
          80s.nyc “stories” are blurbs about particular images, either about notable buildings or interesting photos (or both). The initial launch of the site contains some seeded stories. We plan to crowd-source many more stories to add a richer descriptive layer to the imagery collection.
        </p>
        <h3>
          WHAT ARE “MISSING IMAGES”? WHY DO SOME BLOCKS ONLY HAVE A FEW (OR ONE, OR NO) PHOTOS?
        </h3>
        <p>
          Some locations in the city have an identifying BBL code but no corresponding image in the dataset. These are identified as “Missing Images” on 80s.nyc. Occasionally, the dataset itself contains a blank placeholder where a photo isn’t available.
        </p>
        <p>
          Some blocks, in particular those that contain large buildings that take up one side of a street or even an entire block, may be represented in the dataset by just one photo. This might have worked for the original tax appraisal purpose of the data, but unfortunately isn’t very useful for a streetview. Similarly, this dataset doesn’t lend itself to representing corner buildings, only one side of which was usually photographed.
        </p>
        <h3>
          WHO MADE THIS?
        </h3>
        <ul>
          <li>Brandon Liu (<a href="https://twitter.com/bdon">@bdon</a>) - GIS and programming, source for this site available <a href="https://github.com/bdon/80s.nyc">here</a>.</li>
          <li>Jeremy Lechtzin (<a href="https://twitter.com/jeremylechtzin">@jeremylechtzin</a>) - history; research; data collection. Writes about historic Brooklyn through data at <a href="https://oldbrooklynheights.com">oldbrooklynheights.com</a></li>
        </ul>
        <h3>
          COPYRIGHT NOTICE
        </h3>
        <p>
          The photographic database that this source code is designed to interface with contains low-resolution images which are the property of the New York City Municipal Archives. Any use of these images is subject to <a href="http://www1.nyc.gov/site/records/about/terms-and-conditions.page">terms and conditions found here</a>. 
        </p>
        <p>
          This includes any derivative images created or used by this code. The image database may not be used for any commercial purpose without appropriate permission. Prints or high-resolution images should be ordered from the Municipal Archives via <a href="http://www.nyc.gov/html/records/html/gallery/orderform.shtml">this page, which describes the conditions for their use</a>.
        </p>
        <h3>
          OTHER MAP DATA
        </h3>
        <p>
          PLUTO and Digital Tax Map.
          MapboxGL and Tippecanoe.
          Base map data © OpenStreetMap contributors.
          Geosearch via <a href="http://geosearch.planninglabs.nyc">NYC Planning Labs</a>.
        </p>
        <div onClick={this.props.closeInfostrip}>
          <span className="dark-gray">ABOUT</span>
          <span className="pv1 fr">CLOSE</span>
        </div>
      </div>
    );
  }
}

export {About}
