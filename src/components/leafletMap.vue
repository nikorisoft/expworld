<template lang="pug">
.map-component
    .leaflet-container(id="leaflet-container")
</template>

<script lang="ts">
import { Feature, FeatureCollection } from "geojson";
import L from "leaflet";
import { defineComponent } from "vue";

import { ExpStateString, UserGeoStateMap } from "../data/exp";
import { CodeFeatureMap } from "../data/geo";

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
        data: Object,
        featureMap: Object,
        noAutoFit: Boolean
    },

    setup() {
        const featureObjects: { [code: string]: L.GeoJSON } = {};

        return {
            featureObjects
        };
    },

    mounted() {
        const map = L.map("leaflet-container").setView([0, 0], 3);
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        tileLayer.addTo(map);

        const data = this.data as UserGeoStateMap;

        const featureMap = this.featureMap as CodeFeatureMap;
        const features: Feature[] = [];
        for (const code in featureMap) {
            features.push(featureMap[code].feature);
        }

        const featureCollection: FeatureCollection = {
            type: "FeatureCollection",
            features
        };
        const bounds = L.geoJSON(featureCollection).getBounds();

        for (const code in featureMap) {
            const feature = L.geoJSON(featureMap[code].feature);
            feature.bindPopup(() => {
                const data = this.data as UserGeoStateMap;

                if (data != null && data[code] != null) {
                    return `${featureMap[code].name} (${ExpStateString[data[code].state]})`;
                } else {
                    return `${featureMap[code].name}`;
                }
            });

            feature.on("popupopen", () => {
                this.$emit("clicked", code);
            });

            feature.on("popupclose", () => {
                this.$emit("clicked", "");
            });

            if (data != null && data[code] != null) {
                const state = data[code].state;

                feature.setStyle(styles[state]);
            } else {
                feature.setStyle(styles[0]);
            }

            feature.addTo(map);

            this.featureObjects[code] = feature;
        }
        if (this.noAutoFit !== true) {
            map.fitBounds(bounds);
        }
    },

    watch: {
        data: {
            handler() {
                console.debug("Map: data change detected", this.data);
                const data = this.data as UserGeoStateMap;

                if (data != null) {
                    for (const code in this.featureMap) {
                        const feature = this.featureObjects[code];
                        const state = data[code].state;

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
    height: 50vh;
}
</style>
