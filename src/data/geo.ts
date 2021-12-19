import { Feature } from "geojson";
import countriesGeoJson from "../assets/3166-1.geojson";
import { countryData } from "./area";

export type CodeFeatureMap = {
    [countryCode: string]: {
        name: string;
        feature: Feature;
    }
};

if (countriesGeoJson.features == null) {
    throw new Error("GeoJson data invalid");
}

export const countryFeatures: CodeFeatureMap = {};

for (const f of countriesGeoJson.features) {
    if (f != null && f.properties != null && f.properties["ISO3166-1"] != null) {
        const code = f.properties["ISO3166-1"] as string;
        if (countryData[code] != null) {
            countryFeatures[code] = {
                name: countryData[code].name,
                feature: f
            };
        } else {
            console.log("Excluding %s", code);
        }
    } else {
        console.log("No ISO3166-1");
    }
}

export function getCountryFeature(code: string): Feature {
    return countryFeatures[code].feature;
}
