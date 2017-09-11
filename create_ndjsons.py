import os
import progressbar
import psycopg2
import psycopg2.extras
import json
from shapely.wkt import dumps, loads
from shapely.geometry import shape, asShape, MultiLineString, LineString, mapping

conn = psycopg2.connect('dbname=streetview')
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
cur2 = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cur.execute("select count(*) from filmstrips;")
strips = cur.fetchone()['count']
bar = progressbar.ProgressBar(max_value=strips)

# LION Data Dictionary https://www1.nyc.gov/assets/planning/download/pdf/data-maps/open-data/lion_metadata.pdf?r=17a

#create index on lion (segmentid);
#create index on lion (nodeidfrom);
#create index on lion (nodeidto);
#cur.execute("select addgeometrycolumn('filmstrips','buffgeom',2263,'POLYGON',2)")
#cur.execute("update filmstrips set buffgeom = ST_Buffer(ST_SetSRID(geom,2263),90)")
# pull it back out reprojected into 4326
cur.execute("select st_AsText(st_transform(st_setsrid(st_simplify(geom,1),2263),4326)) as geom, id, boro, block, lot_list from filmstrips;")

filmstrips_file = open('filmstrips.ndjson','w')
lots_file = open('lots.ndjson','w')

def street_names(fsid):
    cur2.execute("""
    select st_length(st_intersection(filmstrips.buffgeom,lion.wkb_geometry)) as interlen, 
    lion.segmentid as segmentid, 
    lion.nodeidfrom as nodeidfrom, 
    lion.nodeidto as nodeidto,
    lion.street as street
    from filmstrips, lion 
    where st_intersects(filmstrips.buffgeom,lion.wkb_geometry) 
    and filmstrips.id = %s
    and lion.featuretyp = '0' 
    and nonped != 'V'
    and segmenttyp in ('G','U') 
    order by interlen desc 
    limit 1;
    """,(fsid,))

    parallel_segment = cur2.fetchone()
    if not parallel_segment:
        return None,None,None
    else:
        street = parallel_segment['street']
        nodeidfrom = parallel_segment['nodeidfrom']
        nodeidto = parallel_segment['nodeidto']
        cur2.execute("select distinct street from lion where (nodeidfrom = %s or nodeidto = %s) and lion.featuretyp = '0' and nonped != 'V' and segmenttyp in ('G','U') and street != %s",(nodeidfrom,nodeidfrom,street))
        from_names = cur2.fetchall()
        cur2.execute("select distinct street from lion where (nodeidfrom = %s or nodeidto = %s) and lion.featuretyp = '0' and nonped != 'V' and segmenttyp in ('G','U') and street != %s",(nodeidto,nodeidto,street))
        to_names = cur2.fetchall()
        if len(from_names) == 1 and len(to_names) == 1:
            #print from_names[0]['street'],street,to_names[0]['street']
            return street,from_names[0]['street'],to_names[0]['street']
        else:
            return street,None,None

for i,row in enumerate(cur):
    def lot_id_to_obj(lot_id,block_id,boro,i):
        photo_path = 'www-data/photos/{0}/{1:05d}/{2:04d}.jpg'.format(boro,int(block_id),int(lot_id))
        has_photo = os.path.isfile(photo_path)
        return {'photo':has_photo,'lot_id':lot_id,'i':i}

    bar.update(i)
    fsid = row['id']
    mid,left,right = street_names(fsid)
    lot_objs = [lot_id_to_obj(lot_id,row['block'],row['boro'],i) for i, lot_id in enumerate(row['lot_list'])]
    if any([x['photo'] for x in lot_objs]):
        o = {
            'type':'Feature',
            'geometry':mapping(loads(row['geom'])),
            'properties':{
                'id':fsid,
                'boro':int(row['boro']),
                'block':int(row['block']),
                'lots':lot_objs,
                'sname':mid,
                'lname':left,
                'rname':right
            },
            'tippecanoe':{'minzoom':13}
        }
        filmstrips_file.write(json.dumps(o) + "\n")

        # write all the lot geometries
        for i, lot_id in enumerate(row['lot_list']):
            cur4 = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur4.execute("select ST_AsGeoJSON(st_snaptogrid(ST_transform(st_setsrid(geom,2263),4326),0.000001)) as geom from dtm_1116_tax_lot_polygon where boro = %s and block = %s and lot = %s", (row['boro'],row['block'],lot_id))
            one = cur4.fetchone()
            lot_geom = one['geom']
            o = {'type':'Feature','properties':{'lot':lot_id,'fsid':fsid}, 'geometry': json.loads(lot_geom), 'tippecanoe':{'minzoom':13}}
            lots_file.write(json.dumps(o) + "\n")


filmstrips_file.close()
lots_file.close()
