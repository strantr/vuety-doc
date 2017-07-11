#!/usr/bin/env node --harmony
import { cwd } from "process";
import { lstat, writeFile, mkdir, exists } from "fs";
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

console.log(options);

if (!options.input || !options.input.length) {
    throw new Error("No input files specified");
}

function exludeFile (file, stats) {
    return !stats.isDirectory() && path.extname(file) !== ".ts";
}

const processing = options.input.map(i => {
    return new Promise<VuetyComponent[]>((resolve, reject) => lstat(i, (erro, stats) => {
        if (erro) {
            reject(erro);
        } else {
            if (stats.isFile()) {
                resolve(getDoc(path.resolve(i)));
            } else {
                recursive((i), [exludeFile], function (err, files: string[]) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve([].concat.apply([], files.map(f => {
                            return getDoc(path.resolve(f));
                        })));
                    }
                });
            }
        }
    }));
});

Promise.all(processing).then(results => {
    let output = JSON.stringify([].concat.apply([], results));
    console.log(JSON.stringify([].concat.apply([], results)));
    if (options.output) {
        if (!exists(cwd() + options.output)) mkdir(cwd() + options.output, err => { if(err) throw err; });
        writeFile(cwd() + options.output + "/vuety-doc.json", output, err => { if (err) throw (err); });
    }
});
