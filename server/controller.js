/* eslint-disable */
const multiparty = require("multiparty");
const fse = require("fs-extra");
const path = require("path");

// 大文件存储目录
const UPLOAD_DIR = path.resolve(__dirname, "..", "files");

// 写入文件流
const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });

// 提取POST请求参数
const resolvePost = req =>
  new Promise(resolve => {
    let chunk = "";
    req.on("data", data => {
      chunk += data;
    });
    req.on("end", () => {
      resolve(JSON.parse(chunk));
    });
  });

// 创建临时文件夹用于临时存储chunk (添加 chunkDir 前缀与文件名做区分)
const getChunkDir = fileName => path.resolve(UPLOAD_DIR, `chunkDir_${fileName}`);

// 合并切片
const mergeFileChunk = async (filePath, filename, size) => {
  const chunkDir = getChunkDir(filename);
  const chunkPaths = await fse.readdir(chunkDir);
  // 根据切片下标进行排序，否则直接读取目录的获得的顺序会错乱
  chunkPaths.sort((a, b) => a - b);

  // 并发写入文件
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 根据 size 在指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * size
        })
      )
    )
  );
  // 合并后删除保存切片的目录
  fse.rmdirSync(chunkDir);
};

module.exports = class {
  // 处理文件切片
  async handleFormData(req, res) {
    const multipart = new multiparty.Form();
    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        res.status = 500;
        res.end(
          JSON.stringify({
            code: 100,
            message: "file error"
          })
        );
        return;
      }
      const [chunk] = files.chunk;
      const [filename] = fields.filename;
      const [index] = fields.index;
      const filePath = path.resolve(
        UPLOAD_DIR,
        `${filename}`
      ); // 最终合并后的文件路径
      const chunkDir = getChunkDir(filename); // 存放chunk的文件夹路径
      const chunkPath = path.resolve(chunkDir, index); // 存放每个切片文件的路径

      // 最终合并后的文件已经存在直接返回
      if (fse.existsSync(filePath)) {
        res.end(
          JSON.stringify({
            code: 0,
            message: "file exist"
          })
        );
        return;
      }

      // 切片存在直接返回
      if (fse.existsSync(chunkPath)) {
        res.end(
          JSON.stringify({
            code: 0,
            message: "chunk exist"
          })
        );
        return;
      }

      // 切片目录不存在，创建切片目录
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir);
      }

      await fse.move(chunk.path, chunkPath);
      res.end(
        JSON.stringify({
          code: 0,
          message: "success"
        })
      );
    });
  }

  // 合并切片
  async handleMerge(req, res) {
    const data = await resolvePost(req);
    const { filename, size } = data;
    const filePath = path.resolve(UPLOAD_DIR, `${filename}`);
    await mergeFileChunk(filePath, filename, size);
    res.end(
      JSON.stringify({
        code: 0,
        message: "success"
      })
    );
  }
};
