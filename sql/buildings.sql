select json_build_object(
  'type','Feature',
  'geometry',st_asgeojson(geometry)::json,
  'properties',to_jsonb(row) - 'id' - 'geometry' 
) FROM (SELECT * FROM import.osm_buildings) row;
