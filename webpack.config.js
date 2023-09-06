const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "none",
  entry: "./src/index.ts",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      filename: "index.html",
      template: "./src/index.html",
      title: "Line Drawing Algo Sim",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/public", to: "public" }],
    }),
  ],
  devtool: "eval-source-map",
  devServer: {
    static: path.join(__dirname, "dist"),
    hot: true,
  },
  resolve: {
    extensions: ["*", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(s(a|c)ss)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.ts$/,
        exclude: /node_module/,
        use: "ts-loader",
      },
    ],
  },
};
