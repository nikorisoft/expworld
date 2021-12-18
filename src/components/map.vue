<template lang="pug">
.map
    .leaflet-container(id="leaflet-container")
</template>

<script lang="ts">
import { Feature } from "geojson";
import L from "leaflet";
import { defineComponent, markRaw } from "vue";

import firstLevelGeoJson from "../assets/3166-1.geojson";
import { countryData } from "../data/area";
import { ExpStateString, UserData } from "../data/exp";

const styles: L.PathOptions[] = [
    { color: "#aaa", fillColor: "#fff", fillOpacity: 0.3 }, // None
    { color: "#aaa", fillColor: "#4af", fillOpacity: 0.5 }, // Passed
    { color: "#aaa", fillColor: "#5e3", fillOpacity: 0.5 }, // Landed
    { color: "#aaa", fillColor: "#ff3", fillOpacity: 0.5 }, // Visited
    { color: "#aaa", fillColor: "#f33", fillOpacity: 0.5 }, // Stayed
    { color: "#aaa", fillColor: "#f3f", fillOpacity: 0.5 }, // Lived
];


export default defineComponent({
    props: {
        data: Object
    },

    setup() {
        const geoJson = markRaw(firstLevelGeoJson);
        if (geoJson.features == null) {
            throw new Error("GeoJson data invalid");
        }

        const countryFeatures: { [countryCode: string]: Feature } = {};
        const countryFeatureObjects: { [countryCode: string]: L.GeoJSON } = {};

        for (const f of geoJson.features) {
            if (f != null && f.properties != null && f.properties["ISO3166-1"] != null) {
                const code = f.properties["ISO3166-1"] as string;
                if (countryData[code] != null) {
                    countryFeatures[code] = f;
                } else {
                    console.log("Excluding %s", code);
                }
            } else {
                console.log("No ISO3166-1");
            }
        }

        return {
            countryFeatures,
            countryFeatureObjects
        };
    },

    mounted() {
        const map = L.map("leaflet-container").setView([0, 0], 3);
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        tileLayer.addTo(map);

        const data = this.data as UserData | null;

        for (const code in this.countryFeatures) {
            const feature = L.geoJSON(this.countryFeatures[code]);
            feature.bindPopup((l) => {
                const data = this.data as UserData | null;

                if (data != null && data.countries[code] != null) {
                    return `${countryData[code].name} (${ExpStateString[data.countries[code].state]})`;
                } else {
                    return `${countryData[code].name}`;
                }
            });

            feature.on("popupopen", () => {
                this.$emit("clicked", code);
            });

            feature.on("popupclose", () => {
                this.$emit("clicked", "");
            });

            if (data != null) {
                const state = data.countries[code].state;

                feature.setStyle(styles[state]);
            } else {
                feature.setStyle(styles[0]);
            }

            feature.addTo(map);

            this.countryFeatureObjects[code] = feature;
        }
    },

    watch: {
        data: {
            handler() {
                console.debug("Map: data change detected");
                const data = this.data as UserData | null;

                if (data != null) {
                    for (const code in this.countryFeatures) {
                        const feature = this.countryFeatureObjects[code];
                        const state = data.countries[code].state;
                        if (feature != null) {
                            feature.setStyle(styles[state]);
                        }
                    }
                }
            },
            deep: true
        }
    }
});
</script>

<style lang="css">
.leaflet-container {
    width: 100%;
    height: 60vh;
}
</style>
