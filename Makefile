canoe:
	tippecanoe -f -e www-data/filmstrips -pk -pC -P -Z 12  filmstrips.ndjson lots.ndjson

osm:
	dropdb new-york_new-york
	createdb new-york_new-york
	psql new-york_new-york -c "create extension postgis;"
	imposm3 import -overwritecache -srid 4326 -connection postgis://localhost/new-york_new-york -mapping imposm3_mapping.yml -read data/new-york_new-york.osm.pbf -write -limitto data/boro_clipping.geojson
	tippecanoe -f -e output/tiles -Z 7 -z 14 -B 14 -P --drop-smallest-as-needed filmstrips.ndjson lots.ndjson ndjsons/amenities.ndjson ndjsons/buildings.ndjson ndjsons/landusages.ndjson ndjsons/places.ndjson ndjsons/roads.ndjson ndjsons/waterareas.ndjson ndjsons/waterways.ndjson ndjsons/coast.geojson
	# update import.osm_buildings set height_float = cast(height as float) where height ~ '^[0-9]+(\.[0-9]+)?$';

sqls:
	psql new-york_new-york -t -f sql/amenities.sql > ndjsons/amenities.ndjson
	psql new-york_new-york -t -f sql/waterareas.sql > ndjsons/waterareas.ndjson
	psql new-york_new-york -t -f sql/waterways.sql > ndjsons/waterways.ndjson
	psql new-york_new-york -t -f sql/landusages.sql > ndjsons/landusages.ndjson
	psql new-york_new-york -t -f sql/places.sql > ndjsons/places.ndjson
	psql new-york_new-york -t -f sql/roads.sql > ndjsons/roads.ndjson
	psql new-york_new-york -t -f sql/buildings.sql > ndjsons/buildings.ndjson

serve:
	cd output/tiles && python ../../static_server.py 9000
