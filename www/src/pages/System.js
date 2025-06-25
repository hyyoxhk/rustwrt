import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Descriptions, Button, Space, message, Spin } from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../utils/api';

function System() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/system/info');
      console.log('完整API响应:', response);
      console.log('响应数据:', response.data);
      console.log('响应数据类型:', typeof response.data);
      console.log('success字段:', response.data?.success);
      console.log('data字段:', response.data?.data);
      
      if (response.data && response.data.success && response.data.data) {
        console.log('设置系统信息:', response.data.data);
        setSystemInfo(response.data.data);
      } else {
        console.error('API响应格式错误:', response.data);
        message.error('API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('获取系统信息失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReboot = async () => {
    try {
      await api.post('/api/system/reboot');
      message.success('系统正在重启...');
    } catch (error) {
      message.error('重启失败: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>系统设置</h1>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchSystemInfo}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {/* 调试信息 */}
      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
        <p><strong>调试信息:</strong></p>
        <p>Loading状态: {loading ? 'true' : 'false'}</p>
        <p>systemInfo存在: {systemInfo ? 'true' : 'false'}</p>
        <p>systemInfo内容: {JSON.stringify(systemInfo, null, 2)}</p>
      </div>

      {systemInfo && (
        <>
          {/* 系统概览 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="CPU使用率"
                  value={systemInfo.cpu?.usage_percent || 0}
                  suffix="%"
                  precision={1}
                />
                <Progress 
                  percent={systemInfo.cpu?.usage_percent || 0} 
                  size="small" 
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="内存使用率"
                  value={systemInfo.memory ? 
                    Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100) : 0}
                  suffix="%"
                />
                <Progress 
                  percent={systemInfo.memory ? 
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
                  value={systemInfo.disk?.usage_percent || 0}
                  suffix="%"
                  precision={1}
                />
                <Progress 
                  percent={systemInfo.disk?.usage_percent || 0} 
                  size="small" 
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="运行时间"
                  value={formatUptime(systemInfo.uptime || 0)}
                />
              </Card>
            </Col>
          </Row>

          {/* 系统详细信息 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="系统信息" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="主机名">{systemInfo.hostname}</Descriptions.Item>
                  <Descriptions.Item label="OpenWrt版本">{systemInfo.openwrt_version}</Descriptions.Item>
                  <Descriptions.Item label="CPU型号">{systemInfo.cpu?.model}</Descriptions.Item>
                  <Descriptions.Item label="CPU核心数">{systemInfo.cpu?.cores}</Descriptions.Item>
                  <Descriptions.Item label="负载平均值">
                    {systemInfo.load_average?.join(', ')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="内存信息" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="总内存">
                    {formatBytes(systemInfo.memory?.total || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="已使用">
                    {formatBytes(systemInfo.memory?.used || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="可用内存">
                    {formatBytes(systemInfo.memory?.available || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="空闲内存">
                    {formatBytes(systemInfo.memory?.free || 0)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Card title="磁盘信息" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="总空间">
                    {formatBytes(systemInfo.disk?.total || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="已使用">
                    {formatBytes(systemInfo.disk?.used || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="可用空间">
                    {formatBytes(systemInfo.disk?.free || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="使用率">
                    {systemInfo.disk?.usage_percent?.toFixed(1)}%
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="系统操作" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" block onClick={handleReboot}>
                    重启系统
                  </Button>
                  <Button type="default" block>
                    关机
                  </Button>
                  <Button type="default" block>
                    备份配置
                  </Button>
                  <Button type="default" block>
                    恢复配置
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

export default System;
