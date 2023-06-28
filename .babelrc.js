module.exports = function (api) {
  return {
    "presets": [
      "@babel/preset-env",
      [
        "@babel/preset-react",
        {
          "runtime": "automatic"
        }
      ],
      "@babel/preset-typescript"
    ],
    // 生产环境不使用react-refresh/babel
    "plugins": api.env("production") ?
      [
        "@babel/plugin-transform-runtime"
      ] :
      [
        "@babel/plugin-transform-runtime",
        "react-refresh/babel"
      ]
  }
}