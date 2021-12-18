module.exports = {
    outputDir: "./dist",
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
        }
    }
};
