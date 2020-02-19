tiles:
	# tippecanoe -f -e www-data/filmstrips -pk -pC -P -Z 12  filmstrips.ndjson lots.ndjson
	tippecanoe -f -e output/tiles -Z 7 -z 14 -B 14 -P --drop-smallest-as-needed filmstrips.ndjson lots.ndjson

serve:
	cd output/tiles && python ../../static_server.py 9000
