import { Component, Inject } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    /**
     * I1
     * 
     * @type {string}
     * @memberof TestComponent1
     */
    @Inject("aliased") inject1: string;
    /**
     * I2
     * 
     * @type {string}
     * @memberof TestComponent1
     */
    @Inject inject2: string;
};