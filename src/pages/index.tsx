// eslint-disable-next-line no-use-before-define
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { MAGIC_KEY, TimeLine } from '../types';
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
  TimePicker,
  Card,
  Button,
  Popover,
  Upload,
  message,
} from 'antd';
import ColorPicker from '../componments/ColorPicker';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import TimeLineDrawer from '../componments/TimeLineDrawer';
import { transFormTimeLine } from '../utils/transFormTimeLine';
import { isEqual } from 'lodash';
import { useLocalStorageState } from '@shihengtech/hooks';
import styles from './index.less';

const MockTimeLine: TimeLine = {
  devicePixelRatio: window.devicePixelRatio,
  magicKey: MAGIC_KEY,
  name: '默认配置',
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

const colorFormItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

function loadFile(fileName: string, content: string) {
  let aLink = document.createElement('a');
  let blob = new Blob([content], {
    type: 'text/plain',
  });
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();
  URL.revokeObjectURL(aLink.href);
}

export default () => {
  const [timeline, setTimeLine] = useLocalStorageState<TimeLine>('timeline', MockTimeLine);
  const [form] = Form.useForm();
  const [startImage, setStartImage] = useState<string>();
  const [endImage, setEndImage] = useState<string>();

  useEffect(() => {
    if (!isEqual(form.getFieldsValue(), timeline)) {
      form.setFieldsValue(timeline);
    }
  }, [timeline, form]);

  useLayoutEffect(() => {
    const timeLineInfo = transFormTimeLine(timeline);
    const startCanvas: HTMLCanvasElement = document.querySelector('#start')! as HTMLCanvasElement;
    startCanvas.setAttribute('width', `${timeLineInfo.width}`);
    startCanvas.setAttribute('height', `${timeLineInfo.height}`);
    const context = startCanvas.getContext('2d')!;
    context.clearRect(0, 0, timeLineInfo.width, timeLineInfo.height);
    new TimeLineDrawer(timeLineInfo, context).drawStart();
    setStartImage(startCanvas.toDataURL('image/png'));
    const end: HTMLCanvasElement = document.querySelector('#end')! as HTMLCanvasElement;
    end.setAttribute('width', `${timeLineInfo.width}`);
    end.setAttribute('height', `${timeLineInfo.height}`);
    const endContext = end.getContext('2d')!;
    endContext.clearRect(0, 0, timeLineInfo.width, timeLineInfo.height);
    new TimeLineDrawer(timeLineInfo, endContext).drawEnd();
    setEndImage(end.toDataURL('image/png'));

    const showTimeLineInfo = transFormTimeLine({
      ...timeline,
      position: 'top',
    });
    const showCanvas: HTMLCanvasElement = document.querySelector('#show')! as HTMLCanvasElement;
    showCanvas.setAttribute('width', `${timeLineInfo.width}`);
    showCanvas.setAttribute('height', `${timeLineInfo.size}`);
    const showContext = showCanvas.getContext('2d')!;
    showContext.clearRect(0, 0, timeLineInfo.width, timeLineInfo.height);
    new TimeLineDrawer(showTimeLineInfo, showContext).drawStart();

    const leftTimeLineInfo = transFormTimeLine({
      ...timeline,
      position: 'left',
    });
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
      total = form.getFieldValue('videos')[i].time + total;
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
        <div style={{ flex: 1, display: 'flex', overflow: 'scroll', background: '#f0f2f5' }}>
          <div style={{ height: '100%', background: 'red' }}>
            <canvas id="left" style={{ height: '100%' }}></canvas>
          </div>
          <div style={{ padding: 16, overflow: 'scroll', flex: 1 }}>
            <Form
              style={{ height: '100%' }}
              form={form}
              initialValues={timeline}
              onValuesChange={(_e, values) => {
                setTimeLine((v) => {
                  return {
                    ...v,
                    ...values,
                  };
                });
              }}
            >
              <Row gutter={8} style={{ height: '100%' }}>
                <Col
                  span={12}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Card
                    title="预览"
                    extra={[
                      <Button
                        key="export"
                        type="primary"
                        onClick={() => {
                          download('start');
                          download('end');
                        }}
                      >
                        导出时间轴
                      </Button>,
                      <Button
                        style={{ marginLeft: 8 }}
                        key="exportConfig"
                        type="primary"
                        onClick={() => {
                          loadFile(`${timeline.name}.json`, JSON.stringify(timeline, null, 2));
                        }}
                      >
                        导出配置
                      </Button>,
                      <Upload
                        key="upload"
                        itemRender={() => null}
                        beforeUpload={(file) => {
                          console.log(file);
                          const fileReader = new FileReader();
                          fileReader.onload = (e) => {
                            if (typeof e?.target?.result !== 'string') {
                              return;
                            }
                            const result = e?.target?.result;
                            try {
                              const parsedResult: TimeLine = JSON.parse(result);
                              if (parsedResult.magicKey !== MAGIC_KEY) {
                                message.error('配置文件格式不正确');
                                return;
                              }
                              setTimeLine(JSON.parse(result));
                            } catch (_error) {
                              message.error('解析配置失败');
                            }
                          };
                          fileReader.readAsText(file, 'utf-8');
                          return false;
                        }}
                      >
                        <Button style={{ marginLeft: 8 }}>导入配置</Button>
                      </Upload>,
                    ]}
                  >
                    <Row gutter={8}>
                      <Col span={12}>
                        <Popover
                          placement="bottomLeft"
                          content={<img style={{ maxHeight: '50vh' }} src={startImage}></img>}
                        >
                          <canvas
                            onClick={() => download('start')}
                            id="start"
                            style={{
                              cursor: 'pointer',
                              border: '1px solid #ccc',
                              maxHeight: '500px',
                              maxWidth: '100%',
                            }}
                          />
                        </Popover>
                      </Col>
                      <Col span={12}>
                        <Popover
                          placement="bottomLeft"
                          content={<img style={{ maxHeight: '50vh' }} src={endImage}></img>}
                        >
                          <canvas
                            onClick={() => download('end')}
                            id="end"
                            style={{
                              cursor: 'pointer',
                              border: '1px solid #ccc',
                              maxHeight: '500px',
                              maxWidth: '100%',
                            }}
                          />
                        </Popover>
                      </Col>
                    </Row>
                  </Card>
                  <Card style={{ flex: 1, marginTop: 16, overflow: 'scroll' }} title="信息">
                    <Form.List name="videos">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <Space
                              key={field.key}
                              style={{ display: 'flex' }}
                              align="baseline"
                              className={styles.videos}
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
                        </>
                      )}
                    </Form.List>
                  </Card>
                </Col>
                <Col span={12} style={{ height: '100%' }}>
                  <Card
                    title="配置"
                    style={{ height: '100%', overflow: 'scroll' }}
                    extra={
                      <Form.Item name="name">
                        <Input></Input>
                      </Form.Item>
                    }
                  >
                    <Form.Item label="分割线">
                      <Row>
                        <Col span={12}>
                          <Form.Item label="距离边缘" name="linePadding">
                            <InputNumber></InputNumber>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="线宽" name="lineWidth">
                            <InputNumber></InputNumber>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form.Item>
                    <Form.Item label="时间轴">
                      <Row>
                        <Col span={12}>
                          <Form.Item label="尺寸" name="size">
                            <Slider tooltipVisible={true}></Slider>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="字体大小" name="fontSize">
                            <Slider tooltipVisible={true}></Slider>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="翻转" name="reverse">
                            <Switch></Switch>
                          </Form.Item>
                        </Col>
                        <Col span={18}>
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
                        </Col>
                        <Col span={12}>
                          <Form.Item label="开始">
                            <Form.Item
                              label="分割线颜色"
                              name={['start', 'lineColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                            <Form.Item
                              label="边框颜色"
                              name={['start', 'borderColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                            <Form.Item
                              label="背景色"
                              name={['start', 'backgroundColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                            <Form.Item
                              label="字体颜色"
                              name={['start', 'fontColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="结束">
                            <Form.Item
                              label="分割线颜色"
                              name={['end', 'lineColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                            <Form.Item
                              label="边框颜色"
                              name={['end', 'borderColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                            <Form.Item
                              label="背景色"
                              name={['end', 'backgroundColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                            <Form.Item
                              label="字体颜色"
                              name={['end', 'fontColor']}
                              {...colorFormItemLayout}
                            >
                              <ColorPicker></ColorPicker>
                            </Form.Item>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form.Item>
                    <Form.Item label="屏幕尺寸">
                      <Row>
                        <Col span={8}>
                          <Form.Item label="屏幕宽度" name="width">
                            <InputNumber></InputNumber>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="屏幕高度" name="height">
                            <InputNumber></InputNumber>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="缩放比" name="devicePixelRatio">
                            <InputNumber></InputNumber>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
