import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag } from 'antd';
import { 
  WifiOutlined, 
  GlobalOutlined, 
  DesktopOutlined,
  SafetyOutlined 
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

function Dashboard() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [systemRes, networkRes] = await Promise.all([
        api.get('/api/system/info'),
        api.get('/api/network/status')
      ]);
      
      if (systemRes.data && systemRes.data.success && systemRes.data.data) {
        setSystemInfo(systemRes.data.data);
      } else {
        console.error('系统信息API响应格式错误:', systemRes.data);
      }
      
      if (networkRes.data && networkRes.data.success && networkRes.data.data) {
        setNetworkStatus(networkRes.data.data);
      } else {
        console.error('网络状态API响应格式错误:', networkRes.data);
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const interfaceColumns = [
    {
      title: '接口名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'interface_type',
      key: 'interface_type',
      render: (type) => {
        const typeMap = {
          'Ethernet': { text: '以太网', color: 'blue' },
          'Wireless': { text: '无线', color: 'green' },
          'Loopback': { text: '回环', color: 'orange' },
          'Bridge': { text: '桥接', color: 'purple' },
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Up' ? 'green' : 'red'}>
          {status === 'Up' ? '在线' : '离线'}
        </Tag>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_addresses',
      key: 'ip_addresses',
      render: (addresses) => addresses.join(', ') || '无',
    },
  ];

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <h1>系统仪表板</h1>
      
      {/* 系统概览卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="CPU使用率"
              value={systemInfo?.cpu?.usage_percent || 0}
              suffix="%"
              prefix={<GlobalOutlined />}
            />
            <Progress 
              percent={systemInfo?.cpu?.usage_percent || 0} 
              size="small" 
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="内存使用率"
              value={systemInfo?.memory ? 
                Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100) : 0}
              suffix="%"
              prefix={<DesktopOutlined />}
            />
            <Progress 
              percent={systemInfo?.memory ? 
                Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100) : 0} 
              size="small" 
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="磁盘使用率"
              value={systemInfo?.disk?.usage_percent || 0}
              suffix="%"
              prefix={<SafetyOutlined />}
            />
            <Progress 
              percent={systemInfo?.disk?.usage_percent || 0} 
              size="small" 
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="网络接口"
              value={networkStatus?.interfaces?.length || 0}
              prefix={<WifiOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="系统信息" size="small">
            <p><strong>主机名:</strong> {systemInfo?.hostname}</p>
            <p><strong>OpenWrt版本:</strong> {systemInfo?.openwrt_version}</p>
            <p><strong>运行时间:</strong> {Math.floor((systemInfo?.uptime || 0) / 3600)} 小时</p>
            <p><strong>负载平均值:</strong> {systemInfo?.load_average?.join(', ')}</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="网络状态" size="small">
            <p><strong>默认网关:</strong> {networkStatus?.default_gateway || '无'}</p>
            <p><strong>DNS服务器:</strong> {networkStatus?.dns_servers?.join(', ') || '无'}</p>
            <p><strong>互联网连接:</strong> 
              <Tag color={networkStatus?.internet_connectivity ? 'green' : 'red'}>
                {networkStatus?.internet_connectivity ? '正常' : '断开'}
              </Tag>
            </p>
          </Card>
        </Col>
      </Row>

      {/* 网络接口列表 */}
      <Card title="网络接口">
        <Table
          columns={interfaceColumns}
          dataSource={networkStatus?.interfaces || []}
          rowKey="name"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}

export default Dashboard;
