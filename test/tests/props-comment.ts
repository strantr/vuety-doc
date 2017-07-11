import { Component, Prop } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    /**
     * String Prop
     * 
     * @type {string}
     * @memberof TestComponent1
     */
    @Prop stringProp: string;
    @Prop numberProp: number;
};