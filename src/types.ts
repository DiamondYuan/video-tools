export interface Point {
  x: number;
  y: number;
}

type Direction = 'row' | 'row-reverse' | 'column' | 'column-reverse';

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

export interface TimeLine {
  /**
   * 视频的宽度
   */
  width: number;
  /**
   * 视频的高度
   */
  height: number;

  /**
   * 进度条的四个点
   */
  points: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
  /**
   * 进度条的方向
   */
  direction: Direction;
  /**
   * 各段视频短时间
   */
  videos: VideoInfo[];
  backgroundColor: string;
  progressColor: string;
  fontSize: number;
}
