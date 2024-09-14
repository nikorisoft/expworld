/**
 * Copyright (c) nikorisoft 2021-2024
 * 
 * SPDX-License-Identifier: Apache-2.0
 */
import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import rootComponent from "./components/rootComponent.vue";
import countryViewComponent from "./components/countryView.vue";
import subcountryViewComponent from "./components/subcountryView.vue";
import mapComponent from "./components/leafletMap.vue";

import { initGeoData } from "./data/geo";

console.debug("expworld UI started.");

const routes = [
    { path: "/country/:cc", component: subcountryViewComponent },
    { path: "/", component: countryViewComponent }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

async function start() {
    await initGeoData();

    const app = createApp(rootComponent);
    app.use(router);
    app.component("leaflet-map", mapComponent);
    app.mount("#app");
}

start();
