import { cwd } from "process";
import { lstat } from "fs";
import * as path from "path";
import { getDoc, VuetyComponent } from "./";
const commandLineArgs = require('command-line-args')
const recursive = require('recursive-readdir');

const optionDefinitions = [
    { name: 'input', alias: 'i', type: String, multiple: true, default: true },
    { name: 'output', alias: 'o', type: String, defaultValue: cwd() },
    { name: 'outputType', alias: 't', type: String },
    { name: 'stdout', type: Boolean }
];

interface Options {
    input: string[];
    output: string;
    outputType: "raw" | "markdown";
    stdout: boolean;
}

const options = commandLineArgs(optionDefinitions) as Options;

if (!options.input.length) {
    throw new Error("No input files specified");
}

const processing = options.input.map(i => {
    return new Promise<VuetyComponent[]>((resolve, reject) => lstat(i, (erro, stats) => {
        if (erro) {
            reject(erro);
        } else {
            if (stats.isFile()) {
                resolve(getDoc(path.resolve(i)));
            } else {
                console.log("IS FOLDER", path.resolve(i));
                recursive((i), ["*.*", function (a) { console.log(arguments); }], function (err, files: string[]) {
                    console.log("xxx:", files);
                    if (err) {
                        reject(err);
                    } else {
                        resolve([].concat.apply([], files.map(f => {
                            return getDoc(path.resolve(i));
                        })));
                    }
                });
            }
        }
    }));
});

Promise.all(processing).then(results => {
    console.log(JSON.stringify([].concat.apply([], results)));
});
