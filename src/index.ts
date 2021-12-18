/**
 * Copyright (c) nikorisoft 2022
 * 
 * SPDX-License-Identifier: Apache-2.0
 */
import { createApp } from "vue";
import rootComponent from "./components/root.vue";

console.debug("expworld UI started.");

const app = createApp(rootComponent);
app.mount("#app");
