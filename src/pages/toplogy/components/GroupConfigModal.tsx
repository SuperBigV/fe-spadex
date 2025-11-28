// components/GroupConfigModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';

const GroupConfigModal = ({ visible, onOk, onCancel, initialName = '' }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: initialName,
      });
    }
  }, [visible, initialName, form]);

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      onOk(values.name);
      form.resetFields();
    } catch (error) {
      console.log('表单验证失败:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title='配置机房组'
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      footer={[
        <Button key='cancel' onClick={handleCancel}>
          取消
        </Button>,
        <Button key='submit' type='primary' loading={confirmLoading} onClick={handleOk}>
          确定
        </Button>,
      ]}
    >
      <Form form={form} layout='vertical' name='groupConfigForm'>
        <Form.Item
          name='name'
          label='组名称'
          rules={[
            {
              required: true,
              message: '请输入组名称',
            },
            {
              max: 20,
              message: '组名称不能超过20个字符',
            },
          ]}
        >
          <Input placeholder='请输入机房组名称' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupConfigModal;
