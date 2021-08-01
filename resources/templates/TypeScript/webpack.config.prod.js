const { merge } = require("webpack-merge");
const sharedConfig = require("./webpack.config.shared");
module.exports = merge(sharedConfig, {
    mode: "production",
});
