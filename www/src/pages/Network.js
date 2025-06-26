import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

function Network() {
  const { t } = useTranslation();
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
          'VLAN': { text: 'VLAN', color: 'cyan' },
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
    {
      title: t('common.mac'),
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
      title: t('common.action'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<SettingOutlined />}
            onClick={() => handleConfigure(record)}
          >
            {t('common.settings')}
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
      message.success(t('notifications.settingsSaved'));
      setModalVisible(false);
      fetchNetworkData();
    } catch (error) {
      message.error(t('notifications.settingsFailed'));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('network.title')}</h1>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchNetworkData}
          loading={loading}
        >
          {t('common.refresh')}
        </Button>
      </div>

      <Card title={t('dashboard.networkStatus')} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <strong>{t('network.gateway')}:</strong> {networkStatus?.default_gateway || '无'}
          </div>
          <div>
            <strong>{t('network.dns')}:</strong> {networkStatus?.dns_servers?.join(', ') || '无'}
          </div>
          <div>
            <strong>互联网连接:</strong> 
            <Tag color={networkStatus?.internet_connectivity ? 'green' : 'red'} style={{ marginLeft: 8 }}>
              {networkStatus?.internet_connectivity ? '正常' : '断开'}
            </Tag>
          </div>
        </div>
      </Card>

      <Card title={t('dashboard.networkTraffic')}>
        <Table
          columns={columns}
          dataSource={interfaces}
          rowKey="name"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={t('network.title')}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('common.name')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="type"
            label={t('common.type')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select disabled>
              <Option value="Ethernet">{t('network.lan')}</Option>
              <Option value="Wireless">{t('common.wireless')}</Option>
              <Option value="Bridge">桥接</Option>
              <Option value="VLAN">VLAN</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="ip_addresses"
            label={t('common.ip')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('network.ipAddress')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Network;
