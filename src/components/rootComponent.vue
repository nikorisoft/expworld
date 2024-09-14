<template lang="pug">
.ew-root
    .uk-margin
        .uk-container.uk-container-xlarge
            .uk-flex.uk-flex-between.uk-flex-bottom.uk-margin-bottom
                .uk-flex.uk-flex-bottom
                    h1.uk-margin-remove
                        router-link(to="/").uk-link-heading Worldwide Experience Points
                    .toolbar.uk-margin-left
                        button.uk-button.uk-button-default.uk-button-small(type="button", @click="saveToLocal", :disabled="!anyChanged") Save
                        button.uk-button.uk-button-default.uk-margin-small-left.uk-button-small(type="button", @click="download", uk-icon="download")
                        button.uk-button.uk-button-default.uk-margin-small-left.uk-button-small(type="button", @click="upload", uk-icon="upload")
                        input(type="file", style="display: none", id="expworld_file", accept="application/json")
                        button.uk-button.uk-button-default.uk-margin-small-left.uk-button-small(type="button", @click="getLink", uk-icon="link")

                .exp.uk-text-large.uk-margin-left {{totalPoints}} / {{maximumPoints}} points

            router-view(:data="userData", @update:data="onUpdateData")

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

                p The original idea "experience points for prefectures" (Keiken-chi) was presented and implemented by&nbsp;
                    a(href="https://uub.jp/kkn/") M. Higashide.

    footer.uk-margin-auto-top
        p.uk-text-small.uk-text-muted.uk-text-center Copyright &copy; {{copyrightYear}} nikorisoft - Ver.{{copyrightVersion}}
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { createNewUserData, ExpState, UserData } from "../data/exp";
import { downloadUserData, exportToBinary, importFromBinary, loadFromLocalStorage, saveToLocalStorage, uploadUserData } from "../data/save";

import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";

UIkit.use(Icons);

export default defineComponent({
    computed: {
        totalPoints(): number {
            let total = 0;
            for (const code in this.userData.countries) {
                const c = this.userData.countries[code];
                total += c.state;
            }

            return total;
        }
    },

    mounted() {
        // Probably this aliasing should be revisited later..
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const comp = this;

        const input = document.getElementById("expworld_file") as HTMLInputElement;
        if (input != null) {
            input.addEventListener("change", async function () {
                if (this.files != null) {
                    const userData = await uploadUserData(this.files);
                    if (userData != null) {
                        comp.userData = userData;
                    }
                }
            });
        }

        window.addEventListener("beforeunload", function (e) {
            if (comp.anyChanged) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Do you really want to quit?";
            }
        });
    },

    setup() {
        let data = loadFromLocalStorage();

        if (window.location.search != null) {
            const params = new URLSearchParams(window.location.search);

            const d = params.get("d");
            if (d != null) {
                try {
                    const buffer = Buffer.from(d, "base64");

                    data = importFromBinary(buffer);

                    console.debug("Initial data is originated from the query parameter.", data);
                } catch (e) {
                    console.warn("The data specified by the query parameter is invalid");
                }
            }
        }

        if (data == null) {
            data = createNewUserData();
        }

        const userData = ref(data);
        const anyChanged = ref(false);

        return {
            anyChanged,
            maximumPoints: Object.keys(userData.value.countries).length * ExpState.Lived,
            userData,

            saveToLocal() {
                saveToLocalStorage(userData.value);
                anyChanged.value = false;
            },

            onUpdateData(data: UserData) {
                userData.value = data;
                anyChanged.value = true;
            },

            download() {
                downloadUserData(userData.value);
            },

            upload() {
                const input = document.getElementById("expworld_file") as HTMLInputElement;
                if (input != null) {
                    input.click();
                }
            },

            async getLink() {
                const buffer = exportToBinary(userData.value);
                const base64str = buffer.toString("base64");
                const url = window.location;
                const newUrl = url.protocol + "//" + url.host + url.pathname + "?d=" + base64str;

                try {
                    await navigator.clipboard.writeText(newUrl);
                    UIkit.notification({
                        message: "Successfully copied URL to the clipboard!",
                        status: "success"
                    });
                } catch (e) {
                    UIkit.notification({
                        message: "Failed to copy URL to the clipboard...",
                        status: "danger"
                    });
                }
            },

            copyrightYear: "2021",
            copyrightVersion: "0.1.0"
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