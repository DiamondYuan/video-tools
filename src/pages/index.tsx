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
import TimeLineDrawer from '../componments/TimeLineDrawer';

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

    const leftTimeLineInfo = transForm(
      {
        ...timeline,
        position: 'left',
      },
      window.devicePixelRatio
    );
    const leftCanvas: HTMLCanvasElement = document.querySelector('#left')! as HTMLCanvasElement;
    leftCanvas.setAttribute('width', `${timeLineInfo.size}`);
    leftCanvas.setAttribute('height', `${timeLineInfo.height}`);
    const leftContext = leftCanvas.getContext('2d')!;
    leftContext.clearRect(0, 0, timeLineInfo.width, timeLineInfo.height);
    new TimeLineDrawer(leftTimeLineInfo, leftContext).drawStart();
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
    <div>
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        <div>
          <canvas
            id="show"
            style={{ width: '100%', border: '1px solid #ccc', display: 'block' }}
          ></canvas>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'scroll' }}>
          <div style={{ height: '100%', background: 'red' }}>
            <canvas id="left" style={{ height: '100%' }}></canvas>
          </div>
          <div style={{ padding: 8, overflow: 'scroll' }}>
            <br></br>
            <Row>
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
                <Slider tooltipVisible={false}></Slider>
              </Form.Item>
              <Form.Item label="时间轴尺寸" name="size">
                <Slider tooltipVisible={false}></Slider>
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
                    <Form.Item
                      label="背景色"
                      name={['start', 'backgroundColor']}
                      {...formItemLayout}
                    >
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
        </div>
      </div>
    </div>
  );
};
