const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const commonConfig = require('./webpack.common')

module.exports = {
  ...commonConfig.default,
  mode: 'development',
  entry: './example/index.js',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './build',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './example/index.html'
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  devServer: {
    compress: true,
    port: 9000,
  },
}