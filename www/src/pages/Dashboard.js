import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  WifiOutlined, 
  GlobalOutlined, 
  DesktopOutlined,
  SafetyOutlined 
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

function Dashboard() {
  const { t } = useTranslation();
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
      title: t('common.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.type'),
      dataIndex: 'interface_type',
      key: 'interface_type',
      render: (type) => {
        const typeMap = {
          'Ethernet': { text: t('network.lan'), color: 'blue' },
          'Wireless': { text: t('common.wireless'), color: 'green' },
          'Loopback': { text: '回环', color: 'orange' },
          'Bridge': { text: '桥接', color: 'purple' },
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Up' ? 'green' : 'red'}>
          {status === 'Up' ? t('dhcp.online') : t('dhcp.offline')}
        </Tag>
      ),
    },
    {
      title: t('common.ip'),
      dataIndex: 'ip_addresses',
      key: 'ip_addresses',
      render: (addresses) => addresses.join(', ') || '无',
    },
  ];

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      
      {/* 系统概览卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('dashboard.cpuUsage')}
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
              title={t('dashboard.memoryUsage')}
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
              title={t('dashboard.diskUsage')}
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
              title={t('dashboard.networkTraffic')}
              value={networkStatus?.interfaces?.length || 0}
              prefix={<WifiOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title={t('dashboard.systemStatus')} size="small">
            <p><strong>{t('system.hostname')}:</strong> {systemInfo?.hostname}</p>
            <p><strong>OpenWrt版本:</strong> {systemInfo?.openwrt_version}</p>
            <p><strong>{t('dashboard.uptime')}:</strong> {Math.floor((systemInfo?.uptime || 0) / 3600)} 小时</p>
            <p><strong>负载平均值:</strong> {systemInfo?.load_average?.join(', ')}</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t('dashboard.networkStatus')} size="small">
            <p><strong>{t('network.gateway')}:</strong> {networkStatus?.default_gateway || '无'}</p>
            <p><strong>{t('network.dns')}:</strong> {networkStatus?.dns_servers?.join(', ') || '无'}</p>
            <p><strong>互联网连接:</strong> 
              <Tag color={networkStatus?.internet_connectivity ? 'green' : 'red'}>
                {networkStatus?.internet_connectivity ? '正常' : '断开'}
              </Tag>
            </p>
          </Card>
        </Col>
      </Row>

      {/* 网络接口列表 */}
      <Card title={t('dashboard.networkTraffic')}>
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
