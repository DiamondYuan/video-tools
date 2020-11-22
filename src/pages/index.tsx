// eslint-disable-next-line no-use-before-define
import React, { useLayoutEffect, useState } from 'react';
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
  Upload,
  message,
  Modal,
  Select,
} from 'antd';
import ColorPicker from '../componments/ColorPicker';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import TimeLineDrawer from '../componments/TimeLineDrawer';
import { transFormTimeLine } from '../utils/transFormTimeLine';
import styles from './index.less';
import { useDebounceFn, useLocalStorageState } from 'ahooks';

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

const screen = {
  '320': [200, 240, 576, 482],
  '352': [240, 288],
  '480': [272, 320],
  '512': [384],
  '560': [360],
  '640': [350, 360, 480],
  '648': [486],
  '704': [480],
  '720': [348, 350, 360, 576, 480, 486, 540],
  '768': [576],
  '800': [600, 480],
  '854': [480],
  '960': [540, 640],
  '1024': [600, 768],
  '1152': [864],
  '1280': [720, 768, 800, 1024],
  '1366': [768],
  '1400': [1050],
  '1440': [900],
  '1600': [1024, 1200],
  '1680': [1050],
  '1920': [1200, 1080],
  '2048': [1080, 1536],
  '2560': [1080, 1440, 1600, 2048],
  '3200': [2048, 2400],
  '3440': [1440],
  '3840': [2160, 2400],
  '4096': [2160, 3072],
  '5120': [4096],
  '6400': [4096, 4800],
  '7680': [4320, 4800],
};

type ScreenWidth = keyof typeof screen;

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

const downloadData = (data: string) => {
  let dlLink = document.createElement('a');
  dlLink.download = `时间轴.png`;
  dlLink.href = data;
  dlLink.dataset.downloadurl = ['image/png', dlLink.download, dlLink.href].join(':');
  document.body.appendChild(dlLink);
  dlLink.click();
  document.body.removeChild(dlLink);
};

export default () => {
  const [timeline, setTimeLine] = useLocalStorageState<TimeLine>('timeline', MockTimeLine);
  const [form] = Form.useForm();
  const [startImage, setStartImage] = useState<string>();
  const [endImage, setEndImage] = useState<string>();
  const [first, setFirst] = useState(true);
  const [modal, setModal] = useState<string>('');

  const { run } = useDebounceFn(
    () => {
      if (
        (timeline.height / timeline.width >= 3.5 || timeline.width / timeline.height > 3.5) &&
        !first
      ) {
        return;
      }
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
      setFirst(false);
    },
    {
      wait: 300,
    }
  );

  useLayoutEffect(() => {
    run();
  }, [timeline, run]);

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
    <div style={{ display: first ? 'none' : 'block' }}>
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        <div>
          <canvas
            id="show"
            style={{ width: '100%', border: '1px solid #ccc', display: 'block' }}
          ></canvas>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'scroll', background: '#f0f2f5' }}>
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
                        key="reset"
                        onClick={() => {
                          form.setFieldsValue(MockTimeLine);
                        }}
                      >
                        恢复配置
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
                              form.setFieldsValue(JSON.parse(result));
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
                        <canvas
                          onClick={() => setModal(startImage!)}
                          id="start"
                          style={{
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            maxHeight: '500px',
                            maxWidth: '100%',
                          }}
                        />
                      </Col>
                      <Col span={12}>
                        <canvas
                          id="end"
                          onClick={() => setModal(endImage!)}
                          style={{
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            maxHeight: '500px',
                            maxWidth: '100%',
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                  <Modal
                    title="预览"
                    visible={!!modal}
                    onCancel={() => setModal('')}
                    style={{ top: 20 }}
                    width={'80vw'}
                    cancelText="关闭"
                    okText="下载"
                    onOk={() => {
                      downloadData(modal);
                      setModal('');
                    }}
                  >
                    <img style={{ width: '100%', border: '1px solid black' }} src={modal}></img>
                  </Modal>
                  <Card style={{ flex: 1, marginTop: 16, overflow: 'scroll' }} title="信息">
                    <Form.List name="videos">
                      {(fields, { add, remove }) => {
                        return (
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
                                  disabled={fields.length === 1}
                                  onClick={() => {
                                    remove(field.name);
                                  }}
                                />
                              </Space>
                            ))}
                          </>
                        );
                      }}
                    </Form.List>
                  </Card>
                </Col>
                <Col span={12} style={{ height: '100%' }}>
                  <Card
                    title="配置"
                    style={{ height: '100%', overflow: 'scroll' }}
                    extra={
                      <Form.Item name="name" className={styles.videoFormItemTime}>
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
                            <Slider></Slider>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="字体大小" name="fontSize">
                            <Slider></Slider>
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
                            <Select
                              style={{ width: '100px' }}
                              onChange={(value: ScreenWidth) => {
                                const heightList = screen[value] || [];
                                if (heightList.length > 0) {
                                  const currentHeight = form.getFieldValue('width');
                                  if (!heightList.includes(currentHeight)) {
                                    form.setFieldsValue({
                                      height: heightList[0],
                                    });
                                  }
                                }
                              }}
                              options={Object.keys(screen).map((o) => ({
                                key: o,
                                value: parseInt(o, 10),
                              }))}
                            ></Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="屏幕高度" name="height">
                            <Select
                              style={{ width: '100px' }}
                              disabled={!form.getFieldValue('width')}
                              options={(
                                screen[`${form.getFieldValue('width')}` as ScreenWidth] || []
                              ).map((o) => ({
                                key: `${o}`,
                                value: `${o}`,
                              }))}
                            ></Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="缩放比" name="devicePixelRatio">
                            <InputNumber max={4} min={1}></InputNumber>
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
