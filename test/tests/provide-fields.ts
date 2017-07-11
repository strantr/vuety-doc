import { Component, Data, Provide } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    
    /**
     * Test
     */
    @Provide provided: string;
};