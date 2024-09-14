import { Feature } from "geojson";
import { countryData } from "./area";

export type CodeFeatureMap = {
    [countryCode: string]: {
        name: string;
        feature: Feature;
    }
};

export const countryFeatures: CodeFeatureMap = {};

export function getCountryFeature(code: string): Feature {
    return countryFeatures[code].feature;
}

export async function initGeoData() {
    const infoResponse = await fetch("./maps/3166-1.geojson");

    if (!infoResponse.ok) {
        console.error("Cannot retrieve world map");
        return;
    }

    const countriesGeoJson = await infoResponse.json();

    if (countriesGeoJson.features == null) {
        throw new Error("GeoJson data invalid");
    }

    for (const f of countriesGeoJson.features) {
        if (f != null && f.properties != null && f.properties["ISO3166-1"] != null) {
            const code = f.properties["ISO3166-1"] as string;
            if (countryData[code] != null) {
                countryFeatures[code] = {
                    name: countryData[code].name,
                    feature: f
                };
            }
        } else {
            console.log("No ISO3166-1");
        }
    }
}
