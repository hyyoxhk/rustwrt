import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Switch, message, Row, Col, Statistic } from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../utils/api';

function DHCP() {
  const [leases, setLeases] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDHCPData();
  }, []);

  const fetchDHCPData = async () => {
    setLoading(true);
    try {
      const [leasesRes, configRes] = await Promise.all([
        api.get('/api/dhcp/leases'),
        api.get('/api/dhcp/config')
      ]);

      if (leasesRes.data && leasesRes.data.success && leasesRes.data.data) {
        setLeases(leasesRes.data.data);
      } else {
        console.error('DHCP租约API响应格式错误:', leasesRes.data);
        message.error('DHCP租约API响应格式错误');
      }
      
      if (configRes.data && configRes.data.success && configRes.data.data) {
        setConfig(configRes.data.data);
      } else {
        console.error('DHCP配置API响应格式错误:', configRes.data);
        message.error('DHCP配置API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('获取DHCP数据失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (values) => {
    try {
      const response = await api.post('/api/dhcp/config', values);
      if (response.data && response.data.success) {
        message.success('DHCP配置更新成功');
        setModalVisible(false);
        fetchDHCPData();
      } else {
        console.error('API响应格式错误:', response.data);
        message.error('API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('更新DHCP配置失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const leaseColumns = [
    {
      title: 'MAC地址',
      dataIndex: 'mac_address',
      key: 'mac_address',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
      render: (hostname) => hostname || '未知',
    },
    {
      title: '租约时间',
      dataIndex: 'lease_time',
      key: 'lease_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '过期时间',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const now = dayjs();
        const expires = dayjs(record.expires_at);
        const isExpired = now.isAfter(expires);
        return (
          <Tag color={isExpired ? 'red' : 'green'}>
            {isExpired ? '已过期' : '活跃'}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>DHCP管理</h1>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchDHCPData}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            icon={<SettingOutlined />} 
            onClick={() => {
              form.setFieldsValue(config);
              setModalVisible(true);
            }}
          >
            配置
          </Button>
        </Space>
      </div>

      {config && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="DHCP状态"
                value={config.enabled ? '启用' : '禁用'}
                valueStyle={{ color: config.enabled ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="IP地址范围"
                value={`${config.start_ip} - ${config.end_ip}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="租约时间"
                value={`${config.lease_time / 3600} 小时`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃租约"
                value={leases.filter(lease => dayjs().isBefore(dayjs(lease.expires_at))).length}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title="DHCP租约">
        <Table
          columns={leaseColumns}
          dataSource={leases}
          rowKey="mac_address"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="DHCP配置"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateConfig}>
          <Form.Item
            name="enabled"
            label="启用DHCP"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="start_ip"
            label="起始IP地址"
            rules={[{ required: true, message: '请输入起始IP地址' }]}
          >
            <Input placeholder="例如: 192.168.1.100" />
          </Form.Item>
          <Form.Item
            name="end_ip"
            label="结束IP地址"
            rules={[{ required: true, message: '请输入结束IP地址' }]}
          >
            <Input placeholder="例如: 192.168.1.200" />
          </Form.Item>
          <Form.Item
            name="lease_time"
            label="租约时间(秒)"
            rules={[{ required: true, message: '请输入租约时间' }]}
          >
            <Input type="number" placeholder="例如: 86400" />
          </Form.Item>
          <Form.Item
            name="dns_servers"
            label="DNS服务器"
            rules={[{ required: true, message: '请输入DNS服务器' }]}
          >
            <Input placeholder="例如: 8.8.8.8,8.8.4.4" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DHCP;
