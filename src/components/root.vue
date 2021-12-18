<template lang="pug">
.ew-root
    .uk-margin-top
        .uk-container.uk-container-xlarge
            h1 Experience Points in the World
            router-view
</template>

<script lang="ts">
import { defineComponent } from "vue";

import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";

UIkit.use(Icons);

export default defineComponent({
    setup() {
        
    },
});
</script>

<style lang="sass">
@import "uikit/src/scss/variables-theme.scss"
@import "uikit/src/scss/mixins-theme.scss"

@import "uikit/src/scss/uikit-theme.scss"
</style>