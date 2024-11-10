//@ts-check

"use strict";

const path = require("path");
// eslint-disable-next-line @typescript-eslint/naming-convention
const CopyPlugin = require("copy-webpack-plugin");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
    target: "webworker", // vscode extensions run in webworker context for VS Code web 📖 -> https://webpack.js.org/configuration/target/#target
    mode: "none",
    entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
        //devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    devtool: "nosources-source-map", //nosources-source-map
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vscodeignore file
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
        extensions: [".ts", ".js"],
        alias: {
            // provides alternate implementation for node module and source files
        },
        fallback: {
            // Webpack 5 no longer polyfills Node.js core modules automatically.
            // see https://webpack.js.org/configuration/resolve/#resolvefallback
            // for the list of Node.js core module polyfills.
            path: require.resolve("path-browserify"),
        },
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "node-loader",
                    },
                ],
            },
        ],
    },
    infrastructureLogging: {
        level: "log", // enables logging required for problem matchers
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.posix.join(__dirname.replace(/\\/g, "/"), "resources"),
                    to: path.posix.join(__dirname.replace(/\\/g, "/"), "dist", "resources"),
                },
                {
                    from: path.posix.join(__dirname.replace(/\\/g, "/"), "CodeFlowResult"),
                    to: path.posix.join(__dirname.replace(/\\/g, "/"), "dist", "CodeFlowResult"),
                },
            ],
        }),
    ],
};

module.exports = [extensionConfig];
