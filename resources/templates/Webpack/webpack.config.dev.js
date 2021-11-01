const { merge } = require("webpack-merge");
const sharedConfig = require("./webpack.config");
module.exports = merge(sharedConfig, {
    mode: "development",
    optimization: {
        minimize: false,
    },
});