import { Component, Provide } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    @Provide("aliased") providedField: string;
};