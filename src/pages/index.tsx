// eslint-disable-next-line no-use-before-define
import React, { useLayoutEffect } from 'react';
import { TimeLine, TimeLineInfo, Point } from 'src/types';

const MockTimeLine: TimeLine = {
  width: 1920,
  height: 1080,
  progressColor: '#1890ff',
  // backgroundColor: '#f5f5f5',
  backgroundColor: 'red',
  fontSize: 20,
  size: 40,
  reverse: false,
  position: 'right',
  videos: [
    {
      time: 200,
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

function transForm(timeLine: TimeLine, devicePixelRatio: number): TimeLineInfo {
  const { position } = timeLine;
  let pointTopLeft: Point = { x: 0, y: 0 };
  let pointBottomRight: Point = { x: 0, y: 0 };
  switch (position) {
    case 'top': {
      pointTopLeft = {
        x: 0,
        y: 0,
      };
      pointBottomRight = {
        x: timeLine.width * devicePixelRatio,
        y: devicePixelRatio * timeLine.size,
      };
      break;
    }
    case 'bottom': {
      pointTopLeft = {
        x: 0,
        y: (timeLine.height - timeLine.size) * devicePixelRatio,
      };
      pointBottomRight = {
        x: timeLine.width * 2,
        y: timeLine.height * 2,
      };
      break;
    }
    case 'left': {
      pointTopLeft = {
        x: 0,
        y: 0,
      };
      pointBottomRight = {
        x: timeLine.size * devicePixelRatio,
        y: devicePixelRatio * timeLine.height,
      };
      break;
    }
    case 'right': {
      pointTopLeft = {
        x: (timeLine.width - timeLine.size) * devicePixelRatio,
        y: 0,
      };
      pointBottomRight = {
        x: timeLine.width * 2,
        y: timeLine.height * 2,
      };
      break;
    }
    default:
      break;
  }
  const points: TimeLineInfo['points'] = {
    topLeft: pointTopLeft,
    bottomRight: pointBottomRight,
    topRight: {
      x: pointTopLeft.x,
      y: pointBottomRight.y,
    },
    bottomLeft: {
      x: pointBottomRight.x,
      y: pointTopLeft.y,
    },
  };
  let totalTime = 0;
  for (let i = 0; i < timeLine.videos.length; i++) {
    totalTime = totalTime + timeLine.videos[i].time;
  }
  const finalVideos = [...timeLine.videos];

  return {
    ...timeLine,
    points,
    totalTime,
    videos: timeLine.reverse ? finalVideos.reverse() : finalVideos,
    size: timeLine.size * devicePixelRatio,
    fontSize: timeLine.fontSize * devicePixelRatio,
    width: timeLine.width * devicePixelRatio,
    height: timeLine.height * devicePixelRatio,
  };
}

class TimeLineDrawer {
  constructor(private timeLineInfo: TimeLineInfo, private context: CanvasRenderingContext2D) {}
  public drawStart() {
    this.drawBackground(this.timeLineInfo.progressColor);
    this.drawLine(this.timeLineInfo.backgroundColor);
  }
  private drawBackground(color: string) {
    const points = this.timeLineInfo.points;
    this.context.fillStyle = color;
    this.context.strokeStyle = color;
    this.context.moveTo(points.topLeft.x, points.topLeft.y);
    this.context.lineTo(points.topRight.x, points.topRight.y);
    this.context.lineTo(points.bottomRight.x, points.bottomRight.y);
    this.context.lineTo(points.bottomLeft.x, points.bottomLeft.y);
    this.context.fill();
    this.context.stroke();
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number) {
    const lineCount = this.getLineCount(text, maxWidth);
    const lineHeight = this.timeLineInfo.fontSize;
    // eslint-disable-next-line no-param-reassign
    y = y - ((lineCount - 1) / 2) * lineHeight;
    let arrText = text.split('');
    let line = '';
    this.context.fillStyle = 'red';
    this.context.font = `${this.timeLineInfo.fontSize}px Arial`;
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
    for (let n = 0; n < arrText.length; n++) {
      let testLine = line + arrText[n];
      let metrics = this.context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        this.context.fillText(line, x, y);
        line = arrText[n];
        // eslint-disable-next-line no-param-reassign
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.context.fillText(line, x, y);
  }

  private getLineCount(text: string, maxWidth: number) {
    let arrText = text.split('');
    let line = '';
    this.context.font = `${this.timeLineInfo.fontSize}px Arial`;
    let lintCount = 1;
    for (let n = 0; n < arrText.length; n++) {
      let testLine = line + arrText[n];
      let metrics = this.context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lintCount++;
        line = arrText[n];
      } else {
        line = testLine;
      }
    }
    return lintCount;
  }

  private drawLine(color: string) {
    const { videos, totalTime, position, points } = this.timeLineInfo;
    let totalLength: number = 0;
    const isRow = position === 'bottom' || position === 'top';
    if (isRow) {
      totalLength = this.timeLineInfo.width;
    } else {
      totalLength = this.timeLineInfo.height;
    }
    let pointer = { x: 0, y: 0 };
    for (const video of videos) {
      const step = (video.time / totalTime) * totalLength;
      const lineSize = this.timeLineInfo.size;
      if (isRow) {
        pointer = {
          x: pointer.x + step,
          y: points.topLeft.y,
        };
        this.context.lineWidth = 2;
        this.context.strokeStyle = color;
        this.context.moveTo(pointer.x, pointer.y);
        this.context.lineTo(pointer.x, pointer.y + lineSize);
        this.context.stroke();
        this.wrapText(video.text, pointer.x - step / 2, lineSize / 2, step);
      } else {
        pointer = {
          x: points.topLeft.x,
          y: pointer.y + step,
        };
        this.context.lineWidth = 2;
        this.context.strokeStyle = color;
        this.context.moveTo(pointer.x, pointer.y);
        this.context.lineTo(pointer.x + lineSize, pointer.y);
        this.context.stroke();
        this.wrapText(video.text, points.topLeft.x + lineSize / 2, pointer.y - step / 2, lineSize);
      }
    }
  }
}

export default () => {
  useLayoutEffect(() => {
    const timeLineInfo = transForm(MockTimeLine, window.devicePixelRatio);
    const canvas: HTMLCanvasElement = document.querySelector('#canvas')! as HTMLCanvasElement;
    canvas.setAttribute('width', `${timeLineInfo.width}`);
    canvas.setAttribute('height', `${timeLineInfo.height}`);
    const context = canvas.getContext('2d')!;
    new TimeLineDrawer(timeLineInfo, context).drawStart();
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
      <div>{'这个是一个辅助工具，输入每段视频的长度，自动生成时间轴。'}</div>
      <br></br>
      <canvas
        id="canvas"
        style={{
          border: '1px solid black',
          height: MockTimeLine.height / 3,
          width: MockTimeLine.width / 3,
        }}
      ></canvas>
      <div></div>
      <button onClick={handleExport}>导出</button>
    </div>
  );
};
