const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
    entry: {
    },
    output: {
        filename: "[name].js",
        sourceMapFilename: "maps/[name].js.map",
        path: path.resolve(__dirname, "./Webresources/scripts"),
        library: ["NAMESPACE", '[name]'],
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

