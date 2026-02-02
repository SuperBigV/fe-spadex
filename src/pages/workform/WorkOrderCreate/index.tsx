import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Upload, message, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { getWorkOrderTypes, createWorkOrder, uploadAttachment } from '@/services/workform';

const { TextArea } = Input;
const { Dragger } = Upload;

export interface WorkOrderCreateFormProps {
  onSuccess?: (id: number) => void;
  onCancel?: () => void;
}

/** 创建工单表单，可在弹框或独立页面中使用 */
const WorkOrderCreateForm: React.FC<WorkOrderCreateFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [typeOptions, setTypeOptions] = useState<{ id: number; name: string }[]>([]);
  const [fileList, setFileList] = useState<{ file_name: string; file_path: string; file_size: number }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getWorkOrderTypes({ pageSize: 500, status: 'enabled' })
      .then((res: any) => setTypeOptions(res?.list || []))
      .catch(() => {});
  }, []);

  const handleUpload = (file: File) => {
    if (fileList.length >= 10) {
      message.warning('最多上传 10 个附件');
      return false;
    }
    setUploading(true);
    uploadAttachment(file)
      .then((res: any) => {
        setFileList((prev) => [...prev, { file_name: res.file_name || file.name, file_path: res.file_path || '', file_size: res.file_size || file.size }]);
        message.success('上传成功');
      })
      .catch((e) => message.error(e?.message || '上传失败'))
      .finally(() => setUploading(false));
    return false;
  };

  const handleRemove = (index: number) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      createWorkOrder({
        work_order_type_id: values.work_order_type_id,
        description: values.description,
        contact_info: values.contact_info,
        attachments: fileList.length > 0 ? fileList : undefined,
      })
        .then((res: any) => {
          const id = res?.id ?? res;
          message.success('创建成功');
          form.resetFields();
          setFileList([]);
          onSuccess?.(id);
        })
        .catch((e) => message.error(e?.message || '创建失败'))
        .finally(() => setLoading(false));
    });
  };

  return (
    <Form form={form} layout='vertical' onFinish={handleSubmit}>
      <Form.Item name='work_order_type_id' label='工单类型' rules={[{ required: true, message: '请选择工单类型' }]}>
        <Select placeholder='请选择工单类型' options={typeOptions.map((o) => ({ value: o.id, label: o.name }))} showSearch optionFilterProp='label' />
      </Form.Item>
      <Form.Item
        name='description'
        label='问题描述'
        rules={[
          { required: true, message: '请输入问题描述' },
          { max: 500, message: '最多 500 字' },
        ]}
      >
        <TextArea rows={5} placeholder='请详细描述您遇到的问题' maxLength={500} showCount />
      </Form.Item>
      <Form.Item name='contact_info' label='联系方式'>
        <Input placeholder='手机/邮箱，便于处理人联系' />
      </Form.Item>
      <Form.Item label='附件'>
        <Dragger beforeUpload={handleUpload} showUploadList={false} disabled={uploading}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>点击或拖拽文件到此区域上传</p>
          <p className='ant-upload-hint'>最多 10 个附件，单个不超过 20MB</p>
        </Dragger>
        {fileList.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {fileList.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span>{f.file_name}</span>
                <Button type='link' size='small' danger onClick={() => handleRemove(i)}>
                  移除
                </Button>
              </div>
            ))}
          </div>
        )}
      </Form.Item>
      <Form.Item>
        <Button type='primary' htmlType='submit' loading={loading}>
          提交
        </Button>
        {onCancel && (
          <Button style={{ marginLeft: 8 }} onClick={onCancel}>
            取消
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default WorkOrderCreateForm;
