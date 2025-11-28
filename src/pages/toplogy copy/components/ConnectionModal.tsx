import React, { useEffect } from 'react';
import { Modal, Form, Select, Input } from 'antd';
import './ConnectionModal.less';

const { Option } = Select;

const ConnectionModal = ({ visible, connection, onCancel, onOk }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && connection) {
      form.setFieldsValue(connection);
    }
  }, [visible, connection, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log('验证失败:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal title='连接属性' visible={visible} onOk={handleOk} onCancel={handleCancel} okText='确定' cancelText='取消'>
      <Form form={form} layout='vertical'>
        <Form.Item name='bandwidth' label='带宽' rules={[{ required: true, message: '请选择带宽' }]}>
          <Select>
            <Option value='10Mbps'>10 Mbps</Option>
            <Option value='100Mbps'>100 Mbps</Option>
            <Option value='1000Mbps'>1 Gbps</Option>
            <Option value='10000Mbps'>10 Gbps</Option>
          </Select>
        </Form.Item>

        <Form.Item name='protocol' label='协议'>
          <Select>
            <Option value='TCP'>TCP</Option>
            <Option value='UDP'>UDP</Option>
            <Option value='ICMP'>ICMP</Option>
          </Select>
        </Form.Item>

        <Form.Item name='description' label='描述'>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConnectionModal;
