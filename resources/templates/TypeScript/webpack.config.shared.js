/* eslint-disable @typescript-eslint/naming-convention */
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
    devtool: "source-map",
    entry: {
        demo: "./src/demo.ts",
    },
    output: {
        filename: "[name].js",
        sourceMapFilename: "maps/[name].js.map",
        path: path.resolve(__dirname, "./Webresources/js"),
        library: ["bebe", "[name]"],
        libraryTarget: "var",
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [new CleanWebpackPlugin()],
    resolve: {
        extensions: [".ts", ".js"],
    },
};
