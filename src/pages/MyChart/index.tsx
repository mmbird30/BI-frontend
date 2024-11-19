import { listChartByPageUsingPost } from '@/services/bi/chartController';
import { useModel } from '@@/exports';
import { Avatar, Card, List, message } from 'antd';
import Search from 'antd/es/input/Search';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 用户管理图表页面
 * @constructor
 */
const MyChart: React.FC = () => {
  //初始化一页查询的数据为12条
  const initSearchParams = {
    //默认第一页
    current: 1,
    //每页展示4条
    pageSize: 4,
  };
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  //全局状态中获取当前登录的用户信息
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  //定义变量存储图表数据
  const [chartList, setChartList] = useState<API.Chart[]>();
  //数据总数，类型为number，默认为0
  const [total, settotal] = useState<number>(0);
  //加载状态，用来控制页面是否加载，默认正在加载
  const [loading, setLoading] = useState<boolean>(true);

  //定义一个获取数据的异步函数
  const loadData = async () => {
    //设置加载状态为正在加载
    setLoading(true);
    /*
      调用后端的接口，传入searchParams参数，返回一个响应res
      当searchParams发生变化时，可以通过setSearchParams来更新searchParams的值
     */
    try {
      const res = await listChartByPageUsingPost(searchParams);
      if (res.data) {
        //将后端返回的数据赋值给chartList
        setChartList(res.data.records ?? []);
        //将后端返回的数据总数赋值给total,如果为空就返回0
        settotal(res.data.total ?? 0);
        //有些图表没有标题，直接把标题全部去掉
        if (res.data.records) {
          res.data.records.forEach((data) => {
            //将后端返回的genChart字段解析为JSON对象,如果为空就返回'{}'
            const chartOption = JSON.parse(data.genChart ?? '{}');
            //把标题设为undefined
            chartOption.title = undefined;
            //把图表数据重新赋值给genChart字段
            data.genChart = JSON.stringify(chartOption);
          });
        }
      } else {
        //如果后端返回的数据为空，就抛出异常提示“获取我的图表错误”
        message.error('获取我的图表错误');
      }
    } catch (e: any) {
      //如果出现异常，提示“获取我的图表错误”+错误原因
      message.error('获取我的图表错误' + e.message);
    }
    //获取数据后，加载完毕，设置为false
    setLoading(false);
  };

  //首次页面加载时，触发加载数据。当searchParams发生变化时，再次触发加载数据
  useEffect(() => {
    loadData();
  }, [searchParams]);

  return (
    <div className="add-chart">
      {/* 搜索框 */}
      <div>
        <Search
          placeholder="请输入图表名称"
          enterButton={loading}
          onSearch={(value) => {
            //当搜索框输入内容时，将searchParams中的name字段设置为输入的内容，并重新加载数据
            //如果用户在第二页，搜索关键词变化并提交后，应该显示搜索后的第一页内容
            setSearchParams({
              //原始搜索条件
              ...initSearchParams,
              //搜索词
              name: value,
            });
          }}
        />
      </div>
      <List
        //栅格
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        //分页
        pagination={{
          /*
            page第几页，pageSize每页显示多少条;
            当用户点击这个分页组件,切换分页时,这个组件就会去触发onChange方法,会改变咱们现在这个页面的搜索条件
          */
          onChange: (page, pageSize) => {
            // 当切换分页，在当前搜索条件的基础上，把页数调整为当前的页数
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            });
          },
          //显示当前页数
          current: searchParams.current,
          //页面参数改成自己的
          pageSize: searchParams.pageSize,
          //总数设置成自己的
          total: total,
        }}
        //加载状态
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            {/*用卡片包裹*/}
            <Card style={{ width: '100%' }}>
              <List.Item.Meta
                //展示对应用户头像
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                title={item.name}
                //描述展示图表类型，如果没有类型就不展示
                description={item.chartType ? '图表类型：' + item.chartType : undefined}
              />
              {/*在元素下面增加16像素外边距*/}
              <div style={{ marginTop: '16px' }} />
              <p>{'分析目标：' + item.goal}</p>
              <p>{'分析结论：' + item.genResult}</p>
              <div style={{ marginTop: '16px' }} />
              {/* 后端生成的图表代码转化为JSON对象 */}
              <ReactECharts option={JSON.parse(item.genChart ?? '{}')} />
            </Card>
          </List.Item>
        )}
      />
      <br />
      总数：{total}
    </div>
  );
};
export default MyChart;
