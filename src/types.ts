export interface Point {
  x: number;
  y: number;
}

interface VideoInfo {
  /**
   * 每一段视频中的文字
   */
  text: string;
  /**
   * 视频的时间，单位秒
   */
  time: number;
}
export interface TimeLineColor {
  backgroundColor: string;
  fontColor: string;
  borderColor: string;
  lineColor: string;
}
export interface TimeLine {
  start: TimeLineColor;
  end: TimeLineColor;
  /**
   * 视频的宽度
   */
  width: number;
  /**
   * 视频的高度
   */
  height: number;

  /**
   * 时间轴的尺寸（ 高度 / 宽度 ）
   */
  size: number;

  /**
   * 时间轴的位置
   */
  position: 'top' | 'bottom' | 'right' | 'left';
  /**
   * 字体颜色
   */
  fontColor: string;
  /**
   * 进度条是否逆向
   */
  reverse: boolean;
  /**
   * 各段视频短时间
   */
  videos: VideoInfo[];
  backgroundColor: string;
  progressColor: string;
  fontSize: number;
  lineColor: string;
}

export interface TimeLineInfo extends TimeLine {
  totalTime: number;
  /**
   * 进度条的四个点
   */
  points: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
}
