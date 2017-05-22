import { Component, Inject } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    @Inject("aliased") injectedField: string;
};