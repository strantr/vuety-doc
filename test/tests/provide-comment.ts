import { Component, Data, Provide } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    /**
     * P1
     * 
     * @type {string}
     * @memberof TestComponent1
     */
    @Provide @Data provided1: string;

    /**
     * P2
     * 
     * @readonly
     * @type {string}
     * @memberof TestComponent1
     */
    @Provide get provided2(): string {
        return ""
    };

    /**
     * P3
     * 
     * @type {string}
     * @memberof TestComponent1
     */
    @Provide("aliased") provided3: string;
};