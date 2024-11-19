import { genChartByAiUsingPost } from '@/services/bi/chartController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, message, Row, Select, Space, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

/**
 * 添加图表页面
 * @constructor
 */
const AddChart: React.FC = () => {
  /**
   * 分析数据
   */
  //定义状态，用来接收后端返回值，并实时展示在页面上
  const [chart, setChart] = useState<API.BiGenVO>();
  const [option, setOption] = useState<any>();
  //提交中的状态，默认未提交
  const [submitting, setSubmitting] = useState<boolean>(false);

  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {
    //如果已经是提交中的状态（还在加载），直接返回，避免重复提交
    if (submitting) {
      return;
    }
    //当开始提交，把setSubmitting设置为true
    setSubmitting(true);
    //对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try {
      /*需要取到上传的原始数据file->file->originFileObj(原始数据)*/
      const res = await genChartByAiUsingPost(params, {}, values.file.file.originFileObj);
      //如果响应成功 ，即分析成功，则有返回值，否则响应失败
      if (!res?.data) {
        message.error('分析失败');
      } else {
        //把后端返回的图表代码赋值给genChart
        const genChart = JSON.parse(res.data.genChart ?? '');
        //如果为空，抛出异常
        if (!genChart) {
          throw new Error('图表代码解析错误');
        } else {
          //如果图表代码不为空，则把响应结果（生成结果和生成图表代码）设置到图表状态里
          setChart(res.data);
          setOption(genChart);
          message.success('分析成功');
        }
      }
      //异常情况下，抛出分析失败+具体失败原因
    } catch (e: any) {
      message.error('异常' + e.message);
    }
    //当提交完成，把setSubmitting设置为false
    setSubmitting(false);
  };

  return (
    //把页面内容指定一个类名add-chart
    <div className="add-chart">
      <Form
        // 表单名称改为addChart
        name="addChart"
        //label标签文本对齐方式，左对齐
        labelAlign="left"
        //label标签宽度
        labelCol={{ span: 6 }}
        //提交事件
        onFinish={onFinish}
        // 初始化数据啥都不填，为空
        initialValues={{}}
      >
        <Divider orientation="left">智能分析</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="goal"
              label="分析目标"
              rules={[{ required: true, message: '请填写你的分析目标！' }]}
            >
              <TextArea />
            </Form.Item>
            <Form.Item name="name" label="图表名称">
              <TextArea />
            </Form.Item>

            <Form.Item name="chartType" label="图表类型" hasFeedback>
              <Select
                options={[
                  { value: '折线图', label: '折线图' },
                  { value: '柱状图', label: '柱状图' },
                  { value: '堆叠图', label: '堆叠图' },
                  { value: '饼图', label: '饼图' },
                  { value: '雷达图', label: '雷达图' },
                ]}
              />
            </Form.Item>
            <Form.Item name="file" label="原始数据">
              <Upload name="file">
                <Button icon={<UploadOutlined />}>上传csv文件</Button>
              </Upload>
            </Form.Item>

            <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
                <Button htmlType="reset">重置</Button>
              </Space>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Card title="可视化图表">
              <div>
                {/*如果图表状态不为空，则渲染图表*/}
                {
                  //后端返回的代码是字符串，不是对象，用JSON.parse解析成对象
                  option && <ReactECharts option={option} />
                }
              </div>
            </Card>
            <Card title="分析结论">
              <div>{chart?.genResult}</div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
export default AddChart;
