import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

function Network() {
  const [interfaces, setInterfaces] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const [interfacesRes, statusRes] = await Promise.all([
        api.get('/api/network/interfaces'),
        api.get('/api/network/status')
      ]);
      
      if (interfacesRes.data && interfacesRes.data.success && interfacesRes.data.data) {
        setInterfaces(interfacesRes.data.data);
      } else {
        console.error('网络接口API响应格式错误:', interfacesRes.data);
        message.error('网络接口API响应格式错误');
      }
      
      if (statusRes.data && statusRes.data.success && statusRes.data.data) {
        setNetworkStatus(statusRes.data.data);
      } else {
        console.error('网络状态API响应格式错误:', statusRes.data);
        message.error('网络状态API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('获取网络数据失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
          'VLAN': { text: 'VLAN', color: 'cyan' },
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
    {
      title: 'MAC地址',
      dataIndex: 'mac_address',
      key: 'mac_address',
      render: (mac) => mac || '无',
    },
    {
      title: '速度',
      dataIndex: 'speed',
      key: 'speed',
      render: (speed) => speed ? `${speed} Mbps` : '未知',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<SettingOutlined />}
            onClick={() => handleConfigure(record)}
          >
            配置
          </Button>
        </Space>
      ),
    },
  ];

  const handleConfigure = (iface) => {
    form.setFieldsValue({
      name: iface.name,
      type: iface.interface_type,
      ip_addresses: iface.ip_addresses.join(', '),
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // 这里应该调用API更新接口配置
      message.success('配置更新成功');
      setModalVisible(false);
      fetchNetworkData();
    } catch (error) {
      message.error('配置更新失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>网络管理</h1>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchNetworkData}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      <Card title="网络状态" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <strong>默认网关:</strong> {networkStatus?.default_gateway || '无'}
          </div>
          <div>
            <strong>DNS服务器:</strong> {networkStatus?.dns_servers?.join(', ') || '无'}
          </div>
          <div>
            <strong>互联网连接:</strong> 
            <Tag color={networkStatus?.internet_connectivity ? 'green' : 'red'} style={{ marginLeft: 8 }}>
              {networkStatus?.internet_connectivity ? '正常' : '断开'}
            </Tag>
          </div>
        </div>
      </Card>

      <Card title="网络接口">
        <Table
          columns={columns}
          dataSource={interfaces}
          rowKey="name"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="配置网络接口"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="接口名称"
            rules={[{ required: true, message: '请输入接口名称' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="type"
            label="接口类型"
            rules={[{ required: true, message: '请选择接口类型' }]}
          >
            <Select disabled>
              <Option value="Ethernet">以太网</Option>
              <Option value="Wireless">无线</Option>
              <Option value="Bridge">桥接</Option>
              <Option value="VLAN">VLAN</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="ip_addresses"
            label="IP地址"
            rules={[{ required: true, message: '请输入IP地址' }]}
          >
            <Input placeholder="例如: 192.168.1.1/24" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Network;
