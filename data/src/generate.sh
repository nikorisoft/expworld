#!/bin/sh

SIMPLIFY_RATIO="5%"
SRC_DIR=`dirname "$0"`
DEST_DIR="${SRC_DIR}/../../src/assets"

mkdir -p ${DEST_DIR}

npx mapshaper -i "${SRC_DIR}/iso3166-1-boundaries.shp" -simplify dp ${SIMPLIFY_RATIO} -o ${DEST_DIR}/3166-1.geojson
npx mapshaper -i "${SRC_DIR}/iso3166-2-boundaries.shp" -simplify dp ${SIMPLIFY_RATIO} -o ${DEST_DIR}/3166-2.geojson

mkdir -p ${DEST_DIR}/subregions

REGIONS_DIR="${SRC_DIR}/node_modules/iso3166-2-db/regions"

for DIR in ${REGIONS_DIR}/*; do
    cp ${DIR}/dispute/UN/en.json ${DEST_DIR}/subregions/`basename ${DIR}`.json
done

mkdir -p ${DEST_DIR}/geojson
node ${SRC_DIR}/divide-features.js ${DEST_DIR}/3166-2.geojson ${DEST_DIR}/geojson
