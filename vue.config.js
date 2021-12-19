const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    outputDir: "./dist",
    publicPath: "./",
    pages: {
        index: {
            entry: "src/index.ts",
            template: "templates/index.html"
        }
    },
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.geojson$/i,
                    type: "json"
                }
            ]
        },
        plugins: [
            new CopyPlugin(
                [
                    { from: "src/assets/geojson", to: "assets/geojson" },
                    { from: "src/assets/subregions", to: "assets/subregions" }
                ]
            )
        ]
    }
};
