import { Component, Prop } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    @Prop() factoryProp1: string;
    @Prop() factoryProp2: any;
};