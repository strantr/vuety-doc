import Vue from "vue";
import { Component, Data, Prop, Provide, Inject } from "vuety";

@Component({
    name: "test-component"
}) export class TestComponent extends Vue {
    @Provide @Prop prop1: string;
    @Prop prop2: number = 10;
    @Prop({
        default: 1
    }) prop3: number;

    @Provide("provided1") @Data data1: string;
    @Data data2: number = 10;
    @Inject("injecty") @Data(() => 10) data3: number;

    @Provide("provided2") fieldName;
    @Inject inject1: string;
}