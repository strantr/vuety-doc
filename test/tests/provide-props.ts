import { Component, Prop, Provide } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    @Provide @Prop provided: string;
};