const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    open: true,
    historyApiFallback: true,
    port: 8000,
  },
  plugins: [
    // 将css独立打包
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
    }),
    // 状态重置问题（更改相关代码保存后，state状态会重置）
    new ReactRefreshWebpackPlugin()
  ]
}