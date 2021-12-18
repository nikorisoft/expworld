<template lang="pug">
.uk-inline.uk-grid-small
    label(v-for="(stateString, value) in states")
        input.uk-radio(type="radio", :id="name + '_radio' + value", :name="name + '_radio'", :value="value", :checked="modelValue == value", @change="radioChanged(value)")
        | &nbsp;{{ stateString }} ({{ value }})
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ExpState, ExpStateString } from "../data/exp";

export default defineComponent({
    props: {
        name: String,
        modelValue: Number
    },

    setup(props, context) {
        return {
            states: ExpStateString,

            radioChanged(value: ExpState) {
                context.emit("update:modelValue", value);
            }
        }
    }
});
</script>
