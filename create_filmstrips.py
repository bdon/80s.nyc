# based on LION and DTM, output "filmstrips" that have all BBLs oriented correctly from left to right.

import json
import shapely
from shapely.geometry import shape, asShape, MultiLineString, LineString, mapping
from shapely.wkt import dumps, loads
import psycopg2
import psycopg2.extras
import progressbar
from filmstrip.stripmaker import StripMaker
import numpy as np

def f7(seq):
    seen = set()
    seen_add = seen.add
    return [x for x in seq if not (x in seen or seen_add(x))]

conn = psycopg2.connect('dbname=streetview')
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
cur.execute("drop table if exists filmstrips;")
cur.execute("create table filmstrips (id serial PRIMARY KEY, boro text, block text, geom geometry, lot_list integer[]);")

#using only the blockID and geom, create filmstrips
# find all lots that are block faces.

cur.execute("select count(*) from dtm_1116_tax_lot_face where block_face = 1")
faces = cur.fetchone()['count']
bar = progressbar.ProgressBar(max_value=faces)
cur.execute("select boro, block, lot, lot_face_l as length, ST_AsText(geom) as geom from dtm_1116_tax_lot_face where block_face = 1 and (boro,block,lot) in (select boro,block,lot from dtm_1116_tax_lot_polygon where boro=boro and block=block and lot=lot) order by boro,block,lot ASC")

class Lot(object):
    def __init__(self,wkt_geom,boro,block,lot_id,length):
        mls = loads(wkt_geom)
        assert mls.geom_type == 'MultiLineString'
        if len(mls.geoms) > 1:
            print "MultiLineString lot face ",boro,block,lot_id
        self.coords = np.array(mls.geoms[0].coords)
        self.lot_id = int(lot_id)
        self.length = int(length)

    def __repr__(self):
        return 'lotface ' + str(self.lot_id)

def process_boroblock(l,boro,block):
    lots = [Lot(face_row['geom'],boro,block,face_row['lot'],face_row['length']) for face_row in l]
    strips = StripMaker(lots).pruned_strips()

    for strip in strips:
        strip.faces.reverse()
        linestring = LineString(strip.pts)
        lot_list = [face.lot_id for face in strip.faces]
        cur2 = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur2.execute("select St_AsText(st_centroid(st_collect(geom))) from dtm_1116_tax_lot_polygon where boro = %s and block = %s and lot = ANY(%s)", (boro,block,lot_list))
        filmstrip_centroid = loads(cur2.fetchone()['st_astext'])
        is_left = strip.point_is_left(filmstrip_centroid)
        if is_left:
            strip.faces.reverse()

        cur3 = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur3.execute("insert into filmstrips (boro, block, geom, lot_list) VALUES (%s, %s,%s,%s);", (boro, block, dumps(linestring), f7(lot_list)))
    conn.commit()


##### main loop
l = []
current_boro = None
current_block = None

n = 0
for face_row in cur:
    boro = face_row['boro']
    block = face_row['block']
    if (boro,block) != (current_boro,current_block):
        if l:
            process_boroblock(l,current_boro,current_block)
        l = []
        current_boro = boro
        current_block = block
    l.append(face_row)
    bar.update(n)
    n = n + 1

process_boroblock(l,current_boro,current_block) # clear out the remaning if we're done iterating

