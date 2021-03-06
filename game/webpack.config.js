const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    mode: "development",
    output: {
        filename: "assets/game/bundle.js",
        path: __dirname + "/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            "gsap": path.resolve(__dirname, "node_modules/gsap")
        }
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true
                }
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and recycle that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        // pixi: "pixi.js"
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: "Hello Exec(ut)",
            template: "./src/index.html"
        }),
        new CopyWebpackPlugin([
            {
                from: "./node_modules/pixi.js/dist/pixi.js",
                to: "assets/game/pixi.js",
            },
            {
                from: "./src/assets",
                to: "assets",
            }
        ]),
    ]
};