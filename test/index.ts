import { expect } from "chai";
import { getDoc } from "../src";
import * as path from "path";
import { exec } from "child_process";

describe("Component", () => {
    it("are extracted", () => {
        const doc = getDoc(path.join(__dirname, "tests/component-basic.ts"));
        expect(doc.length).to.eq(2);
        expect(doc[0].className).to.eq("TestComponent1");
        expect(doc[1].className).to.eq("TestComponent2");
    });
    it("gets component name from options", () => {
        const doc = getDoc(path.join(__dirname, "tests/component-name.ts"));
        expect(doc[0].name).to.eq("Testing");
        expect(doc[1].name).to.eq("HelloWorld");
    });
});

describe("Props", () => {
    it("are extracted", () => {
        const doc = getDoc(path.join(__dirname, "tests/props-basic.ts"));
        expect(doc[0].props.length).to.eq(2);
        expect(doc[0].props[0].name).to.eq("stringProp");
        expect(doc[0].props[1].name).to.eq("numberProp");

        expect(doc[0].props[0].type).to.eq("string");
        expect(doc[0].props[1].type).to.eq("number");
    });
    it("factory syntax props are extracted", () => {
        const doc = getDoc(path.join(__dirname, "tests/props-factory.ts"));
        expect(doc[0].props.length).to.eq(2);
        expect(doc[0].props[0].name).to.eq("factoryProp1");
        expect(doc[0].props[1].name).to.eq("factoryProp2");

        expect(doc[0].props[0].type).to.eq("string");
        expect(doc[0].props[1].type).to.eq("any");
    });
    it("complex prop types are extracted", () => {
        const doc = getDoc(path.join(__dirname, "tests/props-complex.ts"));
        expect(doc[0].props.length).to.eq(1);
        expect(doc[0].props[0].type).to.eq("{ [k: string]: Partial<{ x: number; }>; }");
    });
});

describe("Provide", () => {
    it("extracts aliased names", () => {
        const doc = getDoc(path.join(__dirname, "tests/provide-alias.ts"));
        expect(doc[0].provides.length).to.eq(1);
        expect(doc[0].provides[0].field).to.eq("providedField");
        expect(doc[0].provides[0].name).to.eq("aliased");
        expect(doc[0].provides[0].type).to.eq("string");
    });
    it("extracts provided computes", () => {
        const doc = getDoc(path.join(__dirname, "tests/provide-compute.ts"));
        expect(doc[0].provides.length).to.eq(1);
        expect(doc[0].provides[0].field).to.eq("provided");
        expect(doc[0].provides[0].name).to.eq("provided");
        expect(doc[0].provides[0].type).to.eq("string");
    });
    it("extracts provided data", () => {
        const doc = getDoc(path.join(__dirname, "tests/provide-data.ts"));
        expect(doc[0].provides.length).to.eq(1);
        expect(doc[0].provides[0].field).to.eq("provided");
        expect(doc[0].provides[0].name).to.eq("provided");
        expect(doc[0].provides[0].type).to.eq("string");
    });
    it("extracts provided fields", () => {
        const doc = getDoc(path.join(__dirname, "tests/provide-fields.ts"));
        expect(doc[0].provides.length).to.eq(1);
        expect(doc[0].provides[0].field).to.eq("provided");
        expect(doc[0].provides[0].name).to.eq("provided");
        expect(doc[0].provides[0].type).to.eq("string");
    });
    it("extracts provided props", () => {
        const doc = getDoc(path.join(__dirname, "tests/provide-props.ts"));
        expect(doc[0].provides.length).to.eq(1);
        expect(doc[0].provides[0].field).to.eq("provided");
        expect(doc[0].provides[0].name).to.eq("provided");
        expect(doc[0].provides[0].type).to.eq("string");
    });
});

describe("Inject", () => {
    it("extracts basic injects", () => {
        const doc = getDoc(path.join(__dirname, "tests/inject-basic.ts"));
        expect(doc[0].injects.length).to.eq(1);
        expect(doc[0].injects[0].field).to.eq("injectedField");
        expect(doc[0].injects[0].name).to.eq("injectedField");
        expect(doc[0].injects[0].type).to.eq("string");
    });
    it("extracts aliased names", () => {
        const doc = getDoc(path.join(__dirname, "tests/inject-alias.ts"));
        expect(doc[0].injects.length).to.eq(1);
        expect(doc[0].injects[0].field).to.eq("injectedField");
        expect(doc[0].injects[0].name).to.eq("aliased");
        expect(doc[0].injects[0].type).to.eq("string");
    });
});

describe("CLI", () => {
    it("accepts input as list of files", () => {
        return new Promise((resolve, reject) => {
            exec(`node .\\src\\cli -i ${path.resolve(__dirname, "tests\\component-basic.ts")} ${path.resolve(__dirname, "tests\\component-name.ts")} --stdout`, (error, stdout, stderr) => {
                if (stderr || error) {
                    reject(stderr || error);
                } else {
                    expect(JSON.stringify(JSON.parse(stdout))).to.eq(JSON.stringify([{
                        "className": "TestComponent1", "provides": [], "injects": [], "props": [], "emits": []
                    }, {
                        "className": "TestComponent2", "provides": [], "injects": [], "props": [], "emits": []
                    }, {
                        "className": "TestComponent1", "name": "Testing", "provides": [], "injects": [], "props": [], "emits": []
                    }, {
                        "className": "TestComponent2", "name": "HelloWorld", "provides": [], "injects": [], "props": [], "emits": []
                    }]));
                    resolve();
                }
            });
        });
    });

    it("accepts input as directory", () => {
        return new Promise((resolve, reject) => {
            exec(`node .\\src\\cli -i ${path.resolve(__dirname, "tests\\cli-dir")} --stdout`, (error, stdout, stderr) => {
                if (stderr || error) {
                    reject(stderr || error);
                } else {
                    console.log(stdout);
                    expect(JSON.stringify(JSON.parse(stdout))).to.eq(JSON.stringify([{
                        "className": "TestComponent1", "provides": [], "injects": [], "props": [], "emits": []
                    }, {
                        "className": "TestComponent2", "provides": [], "injects": [], "props": [], "emits": []
                    }, {
                        "className": "TestComponent1", "name": "Testing", "provides": [], "injects": [], "props": [], "emits": []
                    }, {
                        "className": "TestComponent2", "name": "HelloWorld", "provides": [], "injects": [], "props": [], "emits": []
                    }]));
                    resolve();
                }
            });
        });
    });

    it("default output directory is cwd", () => {

    });

    it("output directory can be changed", () => {

    });
});