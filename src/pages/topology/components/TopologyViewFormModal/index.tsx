/*
 * 拓扑视图创建/编辑弹窗
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { TopologyView, ViewCreateData, ViewUpdateData } from '../../types';
import { createTopologyView, updateTopologyView } from '@/services/topology';

const { Option } = Select;
const { TextArea } = Input;

interface TopologyViewFormModalProps {
  visible: boolean;
  editingView: TopologyView | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const TopologyViewFormModal: React.FC<TopologyViewFormModalProps> = ({ visible, editingView, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (visible) {
      if (editingView) {
        form.setFieldsValue({
          name: editingView.name,
          type: editingView.type,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingView, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingView) {
        // 编辑
        const data: ViewUpdateData = {
          name: values.name,
          type: values.type,
        };
        await updateTopologyView(editingView.id, data);
        message.success('更新成功');
      } else {
        // 创建
        const data: ViewCreateData = {
          name: values.name,
          type: values.type,
          config: {
            canvasScale: 1,
            canvasX: 0,
            canvasY: 0,
          },
        };
        await createTopologyView(data);
        message.success('创建成功');
      }

      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || (editingView ? '更新失败' : '创建失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal title={editingView ? '编辑拓扑视图' : '新建拓扑视图'} open={visible} onOk={handleSubmit} onCancel={handleCancel} confirmLoading={loading} width={600} destroyOnClose>
      <Form form={form} layout='vertical'>
        <Form.Item label='视图名称' name='name' rules={[{ required: true, message: '请输入视图名称' }]}>
          <Input placeholder='请输入视图名称' />
        </Form.Item>

        <Form.Item label='视图类型' name='type' rules={[{ required: true, message: '请选择视图类型' }]}>
          <Select placeholder='请选择视图类型'>
            <Option value='room'>机房拓扑</Option>
            <Option value='cross-room'>跨机房拓扑</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopologyViewFormModal;
