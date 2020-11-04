// eslint-disable-next-line no-use-before-define
import React, { useLayoutEffect } from 'react';
import { TimeLine } from 'src/types';

const MockTimeLine: TimeLine = {
  width: 1920,
  height: 1080,
  progressColor: '#1890ff',
  backgroundColor: '#f5f5f5',
  fontSize: 20,
  points: {
    topLeft: {
      x: 0,
      y: 0,
    },
    topRight: {
      x: 1920,
      y: 0,
    },
    bottomRight: {
      x: 1920,
      y: 40,
    },
    bottomLeft: {
      x: 0,
      y: 40,
    },
  },
  direction: 'column',
  videos: [
    {
      time: 30,
      text: '前言',
    },
    {
      time: 60,
      text: '前期准备',
    },
    {
      time: 60,
      text: '剪辑时添加标记',
    },
    {
      time: 40,
      text: '导出参考图',
    },
    {
      time: 100,
      text: '在 PS 绘制时间轴',
    },
    {
      time: 40,
      text: '最后编辑',
    },
    {
      time: 20,
      text: '结尾',
    },
  ],
};

function transForm(timeLine: TimeLine, devicePixelRatio: number): TimeLine {
  const {
    points: { topRight, topLeft, bottomLeft, bottomRight },
  } = timeLine;
  return {
    ...timeLine,
    fontSize: timeLine.fontSize * devicePixelRatio,
    points: {
      topLeft: {
        x: topLeft.x * devicePixelRatio,
        y: topLeft.y * devicePixelRatio,
      },
      topRight: {
        x: topRight.x * devicePixelRatio,
        y: topRight.y * devicePixelRatio,
      },
      bottomRight: {
        x: bottomRight.x * devicePixelRatio,
        y: bottomRight.y * devicePixelRatio,
      },
      bottomLeft: {
        x: bottomLeft.x * devicePixelRatio,
        y: bottomLeft.y * devicePixelRatio,
      },
    },
    width: timeLine.width * devicePixelRatio,
    height: timeLine.height * devicePixelRatio,
  };
}

export default () => {
  useLayoutEffect(() => {
    const timeLineInfo = transForm(MockTimeLine, window.devicePixelRatio);
    const { points, videos } = timeLineInfo;
    const canvas: HTMLCanvasElement = document.querySelector('#canvas')! as HTMLCanvasElement;
    canvas.setAttribute('width', `${timeLineInfo.width}`);
    canvas.setAttribute('height', `${timeLineInfo.height}`);
    const context = canvas.getContext('2d')!;
    context.fillStyle = timeLineInfo.backgroundColor;
    context.strokeStyle = timeLineInfo.backgroundColor;
    context.moveTo(points.topLeft.x, points.topLeft.y);
    context.lineTo(points.topRight.x, points.topRight.y);
    context.lineTo(points.bottomRight.x, points.bottomRight.y);
    context.lineTo(points.bottomLeft.x, points.bottomLeft.y);
    context.fill();
    context.stroke();

    const timeLineHeight = points.bottomRight.y - points.topRight.y;
    let totalTime = 0;
    for (let i = 0; i < videos.length; i++) {
      totalTime = totalTime + videos[i].time;
    }
    let currentXIndex = 0;
    for (const video of videos) {
      const videoWidth = (video.time / totalTime) * timeLineInfo.width;
      currentXIndex = currentXIndex + videoWidth;
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.moveTo(currentXIndex, 0);
      context.lineTo(currentXIndex, timeLineHeight);
      context.stroke();
      context.fillStyle = 'red';
      context.textBaseline = 'middle';
      context.font = `${timeLineInfo.fontSize}px Arial`;
      context.fillText(
        video.text,
        currentXIndex - videoWidth + videoWidth / 2 - context.measureText(video.text).width / 2,
        timeLineHeight / 2
      );
    }
  });

  const handleExport = () => {
    const canvas: HTMLCanvasElement = document.querySelector('#canvas')! as HTMLCanvasElement;
    let dlLink = document.createElement('a');
    dlLink.download = '1.png';
    dlLink.href = canvas.toDataURL('image/png');
    dlLink.dataset.downloadurl = ['image/png', dlLink.download, dlLink.href].join(':');
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
  };

  return (
    <div>
      <canvas
        id="canvas"
        style={{
          border: '1px solid black',
          height: MockTimeLine.height / 2,
          width: MockTimeLine.width / 2,
        }}
      ></canvas>
      <div></div>
      <button onClick={handleExport}>导出</button>
      <div>{'Hello World'}</div>
    </div>
  );
};
