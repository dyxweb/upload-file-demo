/**
 * 大文件上传(显示进度条)
 */
import React, { useEffect, useState } from 'react';
import { Button, message, Table, Progress } from 'antd';
import request from '@/utils/request';

const SIZE = 10 * 1024 * 1024; // 单个文件切片大小
const BigFileProgressUpload = () => {
  const [uploadStatus, setUploadStatus] = useState(''); // 上传的状态
  const [selectFile, setSelectFile] = useState<any>(null); // 选择的文件
  const [chunkData, setChunkData] = useState<any>([]); // 切片文件数据
  const [totalPercentage, setTotalPercentage] = useState<number>(0); // 上传总进度

  // 监听文件切片上传进度影响总进度
  useEffect(() => {
    let percentage = 0;
    chunkData.forEach((item: any) => (percentage += item.percentage));
    setTotalPercentage(percentage / 3);
  }, [chunkData]);

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
        size: file.size,
        percentage: 0
      }));
      setChunkData(fileChunkData);
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
      .map(({ formData, index }: { formData: any; index: number }) =>
        request({
          url: '/upload',
          method: 'POST',
          data: formData,
          // 处理上传进度
          onUploadProgress: function (progressEvent: any) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setChunkData((prev: any) => {
              const newData = [...prev];
              newData[index].percentage = percentCompleted;
              return newData;
            });
          }
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

  const columns = [
    {
      title: '切片',
      dataIndex: 'index',
      render: (value: number) => `${selectFile.name}-${value}`
    },
    {
      title: '切片大小',
      dataIndex: 'size'
    },
    {
      title: '进度',
      dataIndex: 'percentage',
      render: (value: number) => <Progress percent={value} size="small" />
    }
  ];

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
      <h6>总上传进度</h6>
      <Progress percent={totalPercentage} style={{ width: '90%' }} />
      <h6>文件切片上传进度</h6>
      <Table columns={columns} dataSource={chunkData} />
    </div>
  );
};

export default BigFileProgressUpload;
