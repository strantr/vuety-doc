import { Component, Prop } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    @Prop stringProp: string;
    @Prop numberProp: number;
};