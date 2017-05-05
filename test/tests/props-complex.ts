import { Component, Prop } from "vuety";
import Vue from "vue";

@Component() class TestComponent2 extends Vue {
    @Prop complexProp: { [k: string]: Partial<{ x: number }> };
};