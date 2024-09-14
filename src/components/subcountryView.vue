<template lang="pug">
.subareas
    .loading(v-if="loading")
        h2.uk-margin-remove {{ countryName }}
        .uk-container.uk-container-large(style="height: 30vh").uk-flex.uk-flex-center.uk-flex-middle
            .spinner(uk-spinner="ratio: 4")

    .error(v-if="noInformation")
        .uk-alert-danger
            p No subregion information for {{countryName}}

    .contents(v-if="loading === false && noInformation === false")
        .uk-flex.uk-flex-between.uk-flex-bottom.uk-margin-bottom
            h2.uk-margin-remove {{ countryName }}
            .exp {{totalPoints}} / {{maximumPoints}} points

        .uk-container.uk-container-large
            leaflet-map(:data="userData", :featureMap="featureMap", @clicked="onMapSelected")

        .uk-margin.uk-container.uk-container-large
            .uk-inline
                span.uk-form-icon(uk-icon="icon: search")
                a.uk-form-icon.uk-form-icon-flip(href="#", uk-icon="icon: close", @click="filter = ''")
                input.uk-input(type="text", size="30", placeholder="Subregion name", v-model="filter")

            table.uk-table.uk-table-small.uk-table-divider
                thead
                    tr
                        th ISO3166-2
                        th Name
                        th(width="50%") State
                tbody
                    tr(v-for="r in subregions", v-show="filteredRegions.includes(r)")
                        td {{ countryCode }}-{{ r.iso }}
                        td {{ r.name }}
                        td
                            state-radio(:name="r.iso", :modelValue="userData[r.iso].state", @update:modelValue="(value) => radioChanged(r.iso, value)")
</template>

<script lang="ts">
import type { FeatureCollection } from "geojson";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { countryData, ISO3166_2_Data } from "../data/area";
import { ExpState, UserData, UserGeoStateMap } from "../data/exp";
import { CodeFeatureMap, getCountryFeature } from "../data/geo";

import stateRadioComponent from "./stateRadio.vue";

export default defineComponent({
    components: {
        "state-radio": stateRadioComponent
    },

    props: {
        "data": Object
    },

    computed: {
        filteredRegions() {
            if (this.selected != null && this.selected !== "") {
                return this.subregions.filter((r) => r.iso === this.selected);
            } else if (this.filter == null || this.filter === "") {
                return this.subregions;
            } else {
                const filterU = this.filter.toUpperCase();

                return this.subregions.filter((r) => r.iso.includes(filterU) || r.name.toUpperCase().includes(filterU));
            }
        },

        userData() {
            const data = this.data as UserData | null;
            const stateData: UserGeoStateMap = {};

            const cc = this.countryCode;

            const countryUserData = data != null && data.countries != null && data.countries[cc] != null ? data.countries[cc] : null;
            for (const subregion of this.subregions) {
                const code = subregion.iso;
                if (countryUserData != null && countryUserData.subregions[code] != null) {
                    stateData[code] = countryUserData.subregions[code];
                } else {
                    stateData[code] = { state: ExpState.None };
                }
            }

            return stateData;
        },

        totalPoints() {
            let total = 0;
            for (const code in this.userData) {
                total += this.userData[code].state;
            }

            return total;
        },

        maximumPoints() {
            return this.subregions.length * ExpState.Lived;
        }
    },

    mounted() {
        this.reloadChange();
    },

    setup(props, context) {
        const countryCode = ref("");
        const countryName = ref("");
        const loading = ref(true);
        const noInformation = ref(false);
        const route = useRoute();
        const subregions = ref([] as ISO3166_2_Data[]);
        const filter = ref("");
        const selected = ref("");
        const featureMap = ref({} as CodeFeatureMap);

        return {
            countryCode,
            countryName,
            // flags
            loading,
            noInformation,
            // dynamic information
            subregions,
            featureMap,

            filter,
            selected,

            async reloadChange() {
                const cc = route.params.cc as string;

                if (countryCode.value === cc) {
                    loading.value = false;
                    return;
                }

                countryCode.value = cc;
                if (countryData[cc] != null) {
                    countryName.value = countryData[cc].name;
                } else {
                    countryName.value = "";
                    return;
                }

                // Initialize
                window.scrollTo(0, 0);
                filter.value = "";
                selected.value = "";

                // Dynamically load data
                const infoResponse = await fetch("./maps/subregions/" + cc + ".json");
                if (!infoResponse.ok) {
                    console.error("Cannot retrieve subregion information for %s", countryName);

                    noInformation.value = true;
                    loading.value = false;
                    return;
                }

                // ... and geojson
                const info: ISO3166_2_Data[] = await infoResponse.json();
                subregions.value = info.sort((a, b) => (a.iso).localeCompare(b.iso));

                const geoResponse = await fetch("./maps/geojson/" + cc + ".geojson");
                if (!geoResponse.ok) {
                    const countryFeature = getCountryFeature(cc);

                    featureMap.value = {
                        [cc + "-ALL"]: {
                            name: countryName.value,
                            feature: countryFeature
                        }
                    };
                } else {
                    const collection: FeatureCollection = await geoResponse.json();

                    const map: CodeFeatureMap = {};
                    for (const feature of collection.features) {
                        if (feature.properties != null && feature.properties["ISO3166-2"] != null) {
                            const code = feature.properties["ISO3166-2"];

                            const subregion = subregions.value.find((s) => cc + "-" + s.iso === code);
                            if (subregion != null) {
                                map[subregion.iso] = {
                                    name: subregion.name,
                                    feature
                                };
                            }
                        }
                    }

                    featureMap.value = map;
                }

                loading.value = false;
            },

            radioChanged(code: string, value: ExpState) {
                if (props.data != null) {
                    const cc = countryCode.value;

                    const newData = {
                        ...props.data,
                        countries: {
                            ...props.data.countries,
                            [cc]: {
                                ...props.data.countries[cc],
                                subregions: {
                                    ...props.data.countries[cc].subregions,
                                    [code]: {
                                        state: value
                                    }
                                }
                            }
                        }
                    };
                    context.emit("update:data", newData);
                }
            },

            onMapSelected(code: string) {
                selected.value = code;
            }
        }
    },

    watch: {
        $route() {
            this.reloadChange();
        }
    }
});
</script>
