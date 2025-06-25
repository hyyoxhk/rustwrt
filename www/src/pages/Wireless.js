import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message } from 'antd';
import { ReloadOutlined, WifiOutlined } from '@ant-design/icons';
import api from '../utils/api';

function Wireless() {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchWirelessNetworks();
  }, []);

  const fetchWirelessNetworks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/wireless/networks');
      if (response.data && response.data.success && response.data.data) {
        setNetworks(response.data.data);
      } else {
        console.error('API响应格式错误:', response.data);
        message.error('API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('获取无线网络失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleScanNetworks = async () => {
    setScanning(true);
    try {
      const response = await api.post('/api/wireless/scan');
      if (response.data && response.data.success && response.data.data) {
        setNetworks(response.data.data);
        message.success('扫描完成');
      } else {
        console.error('API响应格式错误:', response.data);
        message.error('API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('扫描失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setScanning(false);
    }
  };

  const columns = [
    {
      title: 'SSID',
      dataIndex: 'ssid',
      key: 'ssid',
    },
    {
      title: 'BSSID',
      dataIndex: 'bssid',
      key: 'bssid',
    },
    {
      title: '信道',
      dataIndex: 'channel',
      key: 'channel',
    },
    {
      title: '频率',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (freq) => freq ? `${freq} MHz` : '未知',
    },
    {
      title: '信号强度',
      dataIndex: 'signal_strength',
      key: 'signal_strength',
      render: (strength) => {
        let color = 'red';
        if (strength >= -50) color = 'green';
        else if (strength >= -70) color = 'orange';
        return <Tag color={color}>{strength} dBm</Tag>;
      },
    },
    {
      title: '加密方式',
      dataIndex: 'encryption',
      key: 'encryption',
      render: (encryption) => {
        const colorMap = {
          'Open': 'red',
          'WEP': 'orange',
          'WPA': 'blue',
          'WPA2': 'green',
        };
        return <Tag color={colorMap[encryption] || 'default'}>{encryption}</Tag>;
      },
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>无线网络管理</h1>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchWirelessNetworks}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            icon={<WifiOutlined />} 
            onClick={handleScanNetworks}
            loading={scanning}
          >
            扫描网络
          </Button>
        </Space>
      </div>

      <Card title="可用无线网络">
        <Table
          columns={columns}
          dataSource={networks}
          rowKey="bssid"
          loading={loading || scanning}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default Wireless;
