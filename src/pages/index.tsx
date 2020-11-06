// eslint-disable-next-line no-use-before-define
import React, { useLayoutEffect, useState } from 'react';
import { TimeLine, TimeLineInfo, Point, TimeLineColor } from 'src/types';

import {
  Row,
  Col,
  Form,
  Switch,
  Slider,
  Radio,
  InputNumber,
  Space,
  Input,
  Button,
  TimePicker,
} from 'antd';
import ColorPicker from '../componments/ColorPicker';
import { MinusCircleOutlined, PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const MockTimeLine: TimeLine = {
  lineWidth: 2,
  linePadding: 2,
  start: {
    backgroundColor: '#f5f5f5',
    borderColor: '#f5f5f5',
    lineColor: '#000000',
    fontColor: '#000000',
  },
  end: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
    lineColor: '#fff',
    fontColor: '#fff',
  },
  width: 1920,
  height: 1080,
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
  timeLine.videos = timeLine.videos.filter((o) => o.text !== undefined && o.time !== undefined);
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
    linePadding: timeLine.linePadding * devicePixelRatio,
    lineWidth: timeLine.lineWidth * devicePixelRatio,
  };
}

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
    for (const video of videos) {
      const step = (video.time / totalTime) * totalLength;
      const lineSize = this.timeLineInfo.size;
      if (isRow) {
        pointer = {
          x: pointer.x + step,
          y: points.topLeft.y,
        };
        this.context.beginPath();
        this.context.lineWidth = this.timeLineInfo.lineWidth;
        this.context.strokeStyle = color.lineColor;
        this.context.moveTo(pointer.x, pointer.y + linePadding);
        this.context.lineTo(pointer.x, pointer.y + lineSize - linePadding);
        this.context.stroke();
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
        this.context.beginPath();
        this.context.lineWidth = this.timeLineInfo.lineWidth;
        this.context.strokeStyle = color.lineColor;
        this.context.moveTo(pointer.x + linePadding, pointer.y);
        this.context.lineTo(pointer.x + lineSize - linePadding, pointer.y);
        this.context.stroke();
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

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

export default () => {
  const [timeline, setTimeLine] = useState(MockTimeLine);
  const [form] = Form.useForm();

  useLayoutEffect(() => {
    const timeLineInfo = transForm(timeline, window.devicePixelRatio);
    const startCanvas: HTMLCanvasElement = document.querySelector('#start')! as HTMLCanvasElement;
    startCanvas.setAttribute('width', `${timeLineInfo.width}`);
    startCanvas.setAttribute('height', `${timeLineInfo.height}`);
    const context = startCanvas.getContext('2d')!;
    context.clearRect(0, 0, timeLineInfo.width, timeLineInfo.height);
    new TimeLineDrawer(timeLineInfo, context).drawStart();
    const end: HTMLCanvasElement = document.querySelector('#end')! as HTMLCanvasElement;
    end.setAttribute('width', `${timeLineInfo.width}`);
    end.setAttribute('height', `${timeLineInfo.height}`);
    const endContext = end.getContext('2d')!;
    endContext.clearRect(0, 0, timeLineInfo.width, timeLineInfo.height);
    new TimeLineDrawer(timeLineInfo, endContext).drawEnd();

    const showTimeLineInfo = transForm(
      {
        ...timeline,
        position: 'top',
      },
      window.devicePixelRatio
    );
    const showCanvas: HTMLCanvasElement = document.querySelector('#show')! as HTMLCanvasElement;
    showCanvas.setAttribute('width', `${timeLineInfo.width}`);
    showCanvas.setAttribute('height', `${timeLineInfo.size}`);
    const showContext = showCanvas.getContext('2d')!;
    showContext.clearRect(0, 0, timeLineInfo.width, timeLineInfo.height);
    new TimeLineDrawer(showTimeLineInfo, showContext).drawStart();
  }, [timeline]);

  const download = (id: string) => {
    const canvas: HTMLCanvasElement = document.querySelector(`#${id}`)! as HTMLCanvasElement;
    let dlLink = document.createElement('a');
    dlLink.download = `${id}.png`;
    dlLink.href = canvas.toDataURL('image/png');
    dlLink.dataset.downloadurl = ['image/png', dlLink.download, dlLink.href].join(':');
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
  };

  const getTime = (index: number) => {
    if (index < 0) {
      return moment().startOf('day');
    }
    let total = 0;

    for (let i = 0; i <= index; i++) {
      total = timeline.videos[i].time + total;
    }
    return moment().startOf('day').add(total, 'second');
  };

  return (
    <div style={{ padding: 24 }}>
      <div>{'这个是一个辅助工具，输入每段视频的长度，自动生成时间轴。'}</div>
      <br></br>
      <Row style={{ marginBottom: 8 }}>
        <canvas
          id="show"
          style={{
            border: '1px solid #ccc',
            width: '100%',
          }}
        ></canvas>
      </Row>
      <Row gutter={20}>
        <Col span={12}>
          <canvas
            id="start"
            style={{
              border: '1px solid #ccc',
              maxHeight: '500px',
              maxWidth: '100%',
            }}
          ></canvas>
        </Col>
        <Col span={12}>
          <canvas
            id="end"
            style={{
              border: '1px solid #ccc',
              maxHeight: '500px',
              maxWidth: '100%',
            }}
          ></canvas>
        </Col>
      </Row>
      <Form
        form={form}
        initialValues={timeline}
        onValuesChange={(_e, values) => {
          setTimeLine((v) => {
            console.log('ch');
            return {
              ...v,
              ...values,
            };
          });
        }}
      >
        <Form.List name="videos">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Space
                  key={field.key}
                  style={{ display: 'flex', marginBottom: 8 }}
                  align="baseline"
                >
                  <PlusCircleOutlined
                    onClick={() => {
                      add(
                        {
                          time: 0,
                          text: '',
                        },
                        index
                      );
                    }}
                  />
                  <Form.Item
                    {...field}
                    name={[field.name, 'text']}
                    fieldKey={[field.fieldKey, 'text']}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="时长"
                    {...field}
                    name={[field.name, 'time']}
                    fieldKey={[field.fieldKey, 'time']}
                  >
                    <InputNumber />
                  </Form.Item>
                  <TimePicker
                    showNow={false}
                    format="HH:mm:ss"
                    value={getTime(index)}
                    allowClear={false}
                    onChange={(e) => {
                      const diffSeconds = e!.diff(getTime(index - 1), 'seconds');
                      form.setFields([
                        {
                          name: ['videos', field.name, 'time'],
                          value: diffSeconds,
                        },
                      ]);
                      setTimeLine(form.getFieldsValue());
                    }}
                  />
                  <PlusCircleOutlined
                    onClick={() => {
                      add(
                        {
                          time: 0,
                          text: '',
                        },
                        index + 1
                      );
                    }}
                  />
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      time: 0,
                      text: '',
                    })
                  }
                  icon={<PlusOutlined />}
                >
                  Add field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item label="分割线距离边缘" name="linePadding">
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="线宽" name="lineWidth">
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="屏幕宽度" name="width">
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="屏幕高度" name="height">
          <InputNumber></InputNumber>
        </Form.Item>
        <Form.Item label="逆转" name="reverse">
          <Switch></Switch>
        </Form.Item>
        <Form.Item label="字体大小" name="fontSize">
          <Slider tooltipVisible></Slider>
        </Form.Item>
        <Form.Item label="时间轴尺寸" name="size">
          <Slider tooltipVisible></Slider>
        </Form.Item>
        <Form.Item label="时间轴位置" name="position">
          <Radio.Group>
            {[
              {
                label: '顶部',
                value: 'top',
              },
              {
                label: '底部',
                value: 'bottom',
              },
              {
                label: '左边',
                value: 'left',
              },
              {
                label: '右边',
                value: 'right',
              },
            ].map((o) => (
              <Radio key={o.value} value={o.value}>
                {o.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item label="开始">
              <Form.Item label="分割线颜色" name={['start', 'lineColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
              <Form.Item label="边框颜色" name={['start', 'borderColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
              <Form.Item label="背景色" name={['start', 'backgroundColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
              <Form.Item label="字体颜色" name={['start', 'fontColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="结束">
              <Form.Item label="分割线颜色" name={['end', 'lineColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
              <Form.Item label="边框颜色" name={['end', 'borderColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
              <Form.Item label="背景色" name={['end', 'backgroundColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
              <Form.Item label="字体颜色" name={['end', 'fontColor']} {...formItemLayout}>
                <ColorPicker></ColorPicker>
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div></div>
      <button
        onClick={() => {
          download('start');
          download('end');
        }}
      >
        导出
      </button>
    </div>
  );
};
