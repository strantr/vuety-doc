import { Component, Provide } from "vuety";
import Vue from "vue";

@Component() class TestComponent1 extends Vue {
    @Provide get provided(): string {
        return ""
    };
};