/**
 * 大文件上传
 */
import React, { useState } from 'react';
import { Button, message } from 'antd';
import request from '@/utils/request';

const SIZE = 10 * 1024 * 1024; // 单个文件切片大小
const BigFileUpload = () => {
  const [uploadStatus, setUploadStatus] = useState(''); // 上传的状态
  const [selectFile, setSelectFile] = useState<any>(null); // 选择的文件

  // 选择上传文件时存储文件信息
  const onUploadChange = (e: any) => {
    const [file] = e.target.files;
    if (file) {
      setSelectFile(file);
    }
  };

  // 生成文件切片
  const createFileChunk = (file: any) => {
    const fileChunkList = [];
    let cur = 0;
    while (cur < file.size) {
      fileChunkList.push({ file: file.slice(cur, cur + SIZE) });
      cur += SIZE;
    }
    return fileChunkList;
  };

  // 上传文件
  const uploadFile = () => {
    if (selectFile) {
      setUploadStatus('loading');
      const fileChunkList = createFileChunk(selectFile);
      const fileChunkData: any = fileChunkList.map(({ file }, index) => ({
        index,
        chunk: file,
        size: file.size
      }));
      uploadChunks(fileChunkData);
    }
  };

  // 上传切片
  const uploadChunks = async (fileChunkData: any) => {
    const requestList = fileChunkData
      .map(({ chunk, index }: { chunk: any; index: number }) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('filename', selectFile.name);
        formData.append('index', String(index));
        return { formData, index };
      })
      .map(({ formData }: { formData: any; index: number }) =>
        request({
          url: '/upload',
          method: 'POST',
          data: formData
        })
      );
    await Promise.all(requestList);
    await mergeFile();
  };

  // 通知服务端合并切片
  const mergeFile = async () => {
    await request({
      url: '/merge',
      method: 'POST',
      data: JSON.stringify({
        size: SIZE,
        filename: selectFile.name
      })
    });
    message.success('上传成功');
    setUploadStatus('');
  };

  return (
    <div>
      {/* 正在上传中时disabled */}
      <input
        type="file"
        onChange={onUploadChange}
        disabled={uploadStatus === 'loading'}
      />
      {/* 没有选择文件或正在上传中时disabled */}
      <Button
        onClick={uploadFile}
        disabled={!selectFile || uploadStatus === 'loading'}
      >
        上传
      </Button>
    </div>
  );
};

export default BigFileUpload;
