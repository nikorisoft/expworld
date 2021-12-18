<template lang="pug">
.ew-root
    .uk-margin
        .uk-container.uk-container-xlarge
            h1 Experience Points in the World
            router-view(v-model:data="userData")

            .uk-card.uk-card-default.uk-card-body.uk-card-small.uk-margin-top
                h3.uk-card-title Data source
                p This program uses&nbsp;
                ul
                    li
                        a(href="https://github.com/esosedi/3166") iso3166-2-db
                        | &nbsp;for the names of the countries, regions and subregions. (
                        a(href="https://github.com/esosedi/3166/blob/master/LICENSE") License
                        |)
                    li the boundary information provided by&nbsp;
                        a(href="https://www.volkerkrause.eu/2021/02/13/osm-country-subdivision-boundary-polygons.html") Volker Krause
                        | , which are converted from&nbsp;
                        a(href="https://www.openstreetmap.org/") OpenStreetMap.
                        | &nbsp; (
                        a(href="https://www.openstreetmap.org/copyright") © OpenStreetMap contributors
                        | )

                h3.uk-card-title Disclaimer

                p This program shows the information and the boundaries of the countries and regions based on the original data, the source of which are shown above, and they do not reflect the author's political opinion.
                p Nevertheless, the boundaries of some countries/regions are apparently odd (such as Taiwan and South Africa). Hopefully they will be fixed in the future.

                h3.uk-card-title Acknowledgements

                p The original idea "experience points for prefectures" (Keiken-chi) was proposed and implemented by&nbsp;
                    a(href="https://uub.jp/kkn/") M. Higashide.
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { createNewUserData } from "../data/exp";

import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";

UIkit.use(Icons);

export default defineComponent({
    setup() {
        const userData = ref(createNewUserData());

        return {
            userData
        }
    }
});
</script>

<style lang="sass">
@import "uikit/src/scss/variables-theme.scss"
@import "uikit/src/scss/mixins-theme.scss"

@import "uikit/src/scss/uikit-theme.scss"

@import "../../node_modules/leaflet/dist/leaflet.css"
</style>