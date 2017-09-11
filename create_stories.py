import yaml
import psycopg2
import psycopg2.extras
import json
import os
from shapely.wkt import dumps, loads
from shapely.geometry import mapping
from PIL import Image, ImageOps

conn = psycopg2.connect('dbname=streetview')
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
stories = yaml.load(open("raw_stories.yml").read())

features = []
sprite_entries = {}

THUMB_SIZE = 64
ATLAS_SIZE = 512

atlas = Image.new('RGBA', (ATLAS_SIZE,ATLAS_SIZE), (255, 255, 255, 0))


for i, story in enumerate(stories):
    if 'coords' in story:
        geom = {
            'type':'Point',
            'coordinates':story['coords']
        }
    else:
        cur.execute("select st_astext(st_transform(st_setsrid(st_centroid(geom),2263),4326)) from dtm_1116_tax_lot_polygon where boro = %s and block = %s and lot = %s",(str(story['boro']),str(story['block']),str(story['lot'])))
        geom = mapping(loads(cur.fetchone()['st_astext']))

    boro = story['boro']
    block = story['block']
    lot = story['lot']
    features.append({
        'type':'Feature',
        'geometry':geom,
        'properties':{
            'bbl':[boro,block,lot],
            'addr':story['address'],
            'text':story['text'],
            'id':i
        }
    })
    path = "www-data/photos/{0}/{1:05d}/{2:04d}.jpg".format(boro,block,lot)
    if os.path.isfile(path):
        img = Image.open(path)
        size = (THUMB_SIZE,THUMB_SIZE)
        thumb = ImageOps.fit(img, size, method = Image.ANTIALIAS)
        x = THUMB_SIZE*(i % (ATLAS_SIZE/THUMB_SIZE))
        y = THUMB_SIZE*(i / (ATLAS_SIZE/THUMB_SIZE))
        atlas.paste(thumb,(x,y))
        sprite_entries["story_{0}".format(i)] = {
            "width":THUMB_SIZE,
            "height":THUMB_SIZE,
            "x":x,
            "y":y,
            "pixelRatio":1
        }



atlas.save("www/public/images/atlas.png")
atlas.save("www/public/images/atlas@2x.png")
# write atlas.json
for x in ["www/public/images/atlas.json","www/public/images/atlas@2x.json"]:
    with open(x, 'w') as outfile:
        json.dump(sprite_entries,outfile)

with open("www/public/stories.json", 'w') as outfile:
    json.dump({
        "type":"FeatureCollection",
        "features":features
    },outfile,indent=4, sort_keys=True)
