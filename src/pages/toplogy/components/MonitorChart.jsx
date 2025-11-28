import React, { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';
import './MonitorChart.less';

const MonitorChart = ({ data, color, title }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    // 如果图表已存在，先销毁
    if (chartRef.current) {
      try {
        chartRef.current.destroy();
      } catch (e) {
        console.warn('图表销毁失败:', e);
      }
      chartRef.current = null;
    }

    // 确保容器元素仍然存在
    if (!containerRef.current) return;

    // 创建图表实例
    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      height: 120,
      padding: [10, 20, 20, 40],
    });

    chartRef.current = chart;
    chart.options({
      scale: {
        x: {
          tickCount: 5, // 设置X轴刻度数量
        },
        y: {
          tickCount: 5, // 设置Y轴刻度数量
        },
      },
      axis: {
        x: {
          // 标题样式
          title: null,
          titleFontSize: 16,
          titleFontFamily: 'Arial',
          titleFontWeight: 'bold',
          titleFill: 'white',

          // 轴线样式
          line: true,
          lineStroke: 'white',
          lineLineWidth: 2,

          // 刻度样式
          tick: true,
          tickStroke: 'white',
          tickLineWidth: 1,

          // 刻度值标签样式
          labelFontSize: 12,
          labelFill: 'white',
          labelFontFamily: 'sans-serif',

          // 网格线样式
          grid: true,
          gridStroke: 'white',
          gridStrokeOpacity: 0.7,
        },
        y: {
          // 标题样式
          title: null,
          titleFontSize: 16,
          titleFontFamily: 'Arial',
          titleFontWeight: 'bold',
          titleFill: 'white',

          // 轴线样式
          line: true,
          lineStroke: 'white',
          lineLineWidth: 2,

          // 刻度样式
          tick: true,
          tickStroke: 'white',
          tickLineWidth: 1,

          // 刻度值标签样式
          labelFontSize: 12,
          labelFill: 'white',
          labelFontFamily: 'sans-serif',

          // 网格线样式
          grid: true,
          gridStroke: 'white',
          gridStrokeOpacity: 0.7,
        },
      },
    });
    // 数据处理
    const chartData = data.map((item, index) => ({
      time: item.time,
      value: item.value,
      index,
    }));

    // 配置图表
    chart.data(chartData).encode('x', 'time').encode('y', 'value');

    // // 折线配置
    // chart.line().position('time*value').color(color).size(2).style({
    //   lineWidth: 2,
    // });

    // // 数据点配置
    // chart.point().position('time*value').color(color).size(3).style({
    //   lineWidth: 1,
    //   stroke: '#fff',
    // });
    chart
      .line()
      .style({ stroke: color })
      .label({
        text: '',
        style: {
          dx: -10,
          dy: -12,
          fill: 'white',
        },
      });

    chart.point().style('fill', 'white').tooltip(false);
    // 渲染图表
    chart.render();

    // 清理函数
    return () => {
      // 在销毁前检查图表和容器元素是否存在
      if (chartRef.current) {
        try {
          chartRef.current.destroy();
        } catch (e) {
          console.warn('图表销毁失败:', e);
        }
        chartRef.current = null;
      }
    };
  }, [data, color]);

  if (!data || data.length === 0) {
    return <div className='empty-chart'>暂无数据</div>;
  }

  return <div ref={containerRef} className='monitor-chart' />;
};

export default MonitorChart;
