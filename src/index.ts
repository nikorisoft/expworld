/**
 * Copyright (c) nikorisoft 2022
 * 
 * SPDX-License-Identifier: Apache-2.0
 */
import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import rootComponent from "./components/root.vue";
import countryViewComponent from "./components/countryView.vue";
import subcountryViewComponent from "./components/subcountryView.vue";
import mapComponent from "./components/map.vue";

console.debug("expworld UI started.");

const routes = [
    { path: "/country/:id", component: subcountryViewComponent },
    { path: "/", component: countryViewComponent }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

const app = createApp(rootComponent);
app.use(router);
app.component("leaflet-map", mapComponent);
app.mount("#app");
