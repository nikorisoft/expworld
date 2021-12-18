<template lang="pug">
.countries
    .uk-container.uk-container-large
        leaflet-map(:data="data", @clicked="onCountryClicked")

    .uk-margin.uk-container.uk-container-large
        .uk-inline
            span.uk-form-icon(uk-icon="icon: search")
            a.uk-form-icon.uk-form-icon-flip(href="#", uk-icon="icon: close", @click="filter = ''")
            input.uk-input(type="text", size="30", placeholder="Country / region name", v-model="filter")
        table.uk-table.uk-table-small.uk-table-divider
            thead
                tr
                    th ISO3166-1
                    th Name
                    th(width="50%") State
            tbody
                tr(v-for="c in countries", v-show="filteredCountries.includes(c)")
                    td {{ c.iso }}
                    td {{ c.name }}
                    td
                        state-radio(:name="c.iso", :modelValue="data.countries[c.iso].state", @update:modelValue="(value) => radioChanged(c.iso, value)")
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { countryData } from "../data/area";
import { ExpState, ExpStateString } from "../data/exp";

import stateRadioComponent from "./stateRadio.vue";

interface Country {
    iso: string;
    name: string;
}

export default defineComponent({
    components: {
        "state-radio": stateRadioComponent
    },

    props: {
        data: {
            type: Object
        }
    },

    computed: {
        filteredCountries() {
            if (this.selected != null && this.selected !== "") {
                return this.countries.filter((c) => c.iso === this.selected);
            } else if (this.filter == null || this.filter === "") {
                return this.countries;
            } else {
                const filterU = this.filter.toUpperCase();

                return this.countries.filter((c) => c.iso.includes(filterU) || c.name.toUpperCase().includes(filterU));
            }
        }
    },

    setup(props, context) {
        const countries: Country[] = [];

        for (const code in countryData) {
            countries.push({
                iso: code,
                name: countryData[code].name
            });
        }

        const selected = ref("");

        return {
            currentData: ref(props.data),
            countries,
            states: ExpStateString,
            filter: ref(""),
            selected,
            radioChanged(code: string, newState: ExpState) {
                if (props.data != null) {
                    const newData = {
                        ...props.data,
                        countries: {
                            ...props.data.countries,
                            [code]: {
                                state: newState,
                                subregions: props.data.countries[code].subregions
                            }
                        }
                    };
                    context.emit("update:data", newData);
                }
            },

            onCountryClicked(code: string) {
                selected.value = code;
            }
        };
    }
});
</script>
