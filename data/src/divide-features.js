"use strict";

const fs = require("fs");
const path = require("path");

const src = process.argv[2];
const destDir = process.argv[3];

const originalData = JSON.parse(fs.readFileSync(src));

const features = {};

for (const f of originalData.features) {
    const code = f.properties["ISO3166-2"];

    const [countryCode, regionCode] = code.split("-", 2);

    if (features[countryCode] == null) {
        features[countryCode] = [];
    }
    f.properties["subregion"] = regionCode;
    features[countryCode].push(f);
}

for (const country in features) {
    const countryFeatures = features[country];

    const geojson = JSON.stringify({
        type: "FeatureCollection",
        features: countryFeatures
    });

    fs.writeFileSync(path.join(destDir, `${country}.geojson`), geojson);
}
