import { TimeLineColor, TimeLineInfo } from 'src/types';

class TimeLineDrawer {
  constructor(private timeLineInfo: TimeLineInfo, private context: CanvasRenderingContext2D) {}
  public drawStart() {
    this.drawBackground(this.timeLineInfo.start);
    this.drawLine(this.timeLineInfo.start);
  }
  public drawEnd() {
    this.drawBackground(this.timeLineInfo.end);
    this.drawLine(this.timeLineInfo.end);
  }
  private drawBackground(color: TimeLineColor) {
    const points = this.timeLineInfo.points;
    this.context.fillStyle = color.backgroundColor;
    this.context.strokeStyle = color.borderColor;
    this.context.lineWidth = 2;
    this.context.moveTo(points.topLeft.x, points.topLeft.y);
    this.context.lineTo(points.topRight.x, points.topRight.y);
    this.context.lineTo(points.bottomRight.x, points.bottomRight.y);
    this.context.lineTo(points.bottomLeft.x, points.bottomLeft.y);
    this.context.stroke();
    this.context.fill();
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, color: string) {
    const lineCount = this.getLineCount(text, maxWidth);
    const lineHeight = this.timeLineInfo.fontSize;
    // eslint-disable-next-line no-param-reassign
    y = y - ((lineCount - 1) / 2) * lineHeight;
    let arrText = text.split('');
    let line = '';
    this.context.fillStyle = color;
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

  private getLineCount(text: string = '', maxWidth: number) {
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

  private drawLine(color: TimeLineColor) {
    const { videos, totalTime, position, points, linePadding } = this.timeLineInfo;
    let totalLength: number = 0;
    const isRow = position === 'bottom' || position === 'top';
    if (isRow) {
      totalLength = this.timeLineInfo.width;
    } else {
      totalLength = this.timeLineInfo.height;
    }
    let pointer = { x: 0, y: 0 };
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      if (!video.text || video.time <= 0) {
        continue;
      }
      const isLast = i === videos.length - 1;
      const step = (video.time / totalTime) * totalLength;
      const lineSize = this.timeLineInfo.size;
      if (isRow) {
        pointer = {
          x: pointer.x + step,
          y: points.topLeft.y,
        };
        if (!isLast) {
          this.context.beginPath();
          this.context.lineWidth = this.timeLineInfo.lineWidth;
          this.context.strokeStyle = color.lineColor;
          this.context.moveTo(pointer.x, pointer.y + linePadding);
          this.context.lineTo(pointer.x, pointer.y + lineSize - linePadding);
          this.context.stroke();
        }
        this.wrapText(
          video.text,
          pointer.x - step / 2,
          pointer.y + lineSize / 2,
          step,
          color.fontColor
        );
      } else {
        pointer = {
          x: points.topLeft.x,
          y: pointer.y + step,
        };
        if (!isLast) {
          this.context.beginPath();
          this.context.lineWidth = this.timeLineInfo.lineWidth;
          this.context.strokeStyle = color.lineColor;
          this.context.moveTo(pointer.x + linePadding, pointer.y);
          this.context.lineTo(pointer.x + lineSize - linePadding, pointer.y);
          this.context.stroke();
        }
        this.wrapText(
          video.text,
          points.topLeft.x + lineSize / 2,
          pointer.y - step / 2,
          lineSize,
          color.fontColor
        );
      }
    }
  }
}

export default TimeLineDrawer;
