/* eslint-disable */
const http = require("http");
// const Controller = require("./controller");
const Controller = require("./continueController");
const server = http.createServer();
const controller = new Controller();

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status = 200;
    res.end();
    return;
  }

  // 获取已经上传的文件切片
  if (req.url === "/verify") {
    await controller.handleVerifyUpload(req, res);
    return;
  }

  // 上传文件切片
  if (req.url === "/upload") {
    await controller.handleFormData(req, res);
  }

  // 合并文件切片
  if (req.url === "/merge") {
    await controller.handleMerge(req, res);
    return;
  }
});

server.listen(8080, () => console.log("listening port 8080"));
