import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

function Firewall() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFirewallRules();
  }, []);

  const fetchFirewallRules = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/firewall/rules');
      if (response.data && response.data.success && response.data.data) {
        setRules(response.data.data);
      } else {
        console.error('API响应格式错误:', response.data);
        message.error('API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('获取防火墙规则失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (values) => {
    try {
      const response = await api.post('/api/firewall/rules', values);
      if (response.data && response.data.success) {
        message.success('防火墙规则添加成功');
        setModalVisible(false);
        form.resetFields();
        fetchFirewallRules();
      } else {
        console.error('API响应格式错误:', response.data);
        message.error('API响应格式错误');
      }
    } catch (error) {
      console.error('API错误:', error);
      message.error('添加防火墙规则失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        const colorMap = {
          'Accept': 'green',
          'Drop': 'red',
          'Reject': 'orange',
        };
        return <Tag color={colorMap[action]}>{action}</Tag>;
      },
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
    },
    {
      title: '源地址',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '目标地址',
      dataIndex: 'destination',
      key: 'destination',
    },
    {
      title: '源端口',
      dataIndex: 'source_port',
      key: 'source_port',
      render: (port) => port || '任意',
    },
    {
      title: '目标端口',
      dataIndex: 'destination_port',
      key: 'destination_port',
      render: (port) => port || '任意',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>防火墙管理</h1>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchFirewallRules}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
          >
            添加规则
          </Button>
        </Space>
      </div>

      <Card title="防火墙规则">
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="添加防火墙规则"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddRule}>
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="例如: 允许SSH" />
          </Form.Item>
          <Form.Item
            name="action"
            label="动作"
            rules={[{ required: true, message: '请选择动作' }]}
          >
            <Select placeholder="选择动作">
              <Option value="Accept">允许</Option>
              <Option value="Drop">丢弃</Option>
              <Option value="Reject">拒绝</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="protocol"
            label="协议"
            rules={[{ required: true, message: '请选择协议' }]}
          >
            <Select placeholder="选择协议">
              <Option value="tcp">TCP</Option>
              <Option value="udp">UDP</Option>
              <Option value="icmp">ICMP</Option>
              <Option value="all">所有</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="source"
            label="源地址"
            rules={[{ required: true, message: '请输入源地址' }]}
          >
            <Input placeholder="例如: 192.168.1.0/24 或 any" />
          </Form.Item>
          <Form.Item
            name="destination"
            label="目标地址"
            rules={[{ required: true, message: '请输入目标地址' }]}
          >
            <Input placeholder="例如: 192.168.1.1 或 any" />
          </Form.Item>
          <Form.Item
            name="source_port"
            label="源端口"
          >
            <Input placeholder="例如: 22 或留空表示任意" />
          </Form.Item>
          <Form.Item
            name="destination_port"
            label="目标端口"
          >
            <Input placeholder="例如: 80 或留空表示任意" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Firewall;
