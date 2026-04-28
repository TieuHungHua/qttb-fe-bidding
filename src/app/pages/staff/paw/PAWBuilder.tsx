import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Switch } from '../../../components/ui/switch';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ArrowLeft, Plus, Edit, Trash2, FileText, GripVertical, X } from 'lucide-react';
import { formatDateTime } from '../../../lib/utils';
import { USER_ROLES } from '../../../lib/constants';
import type { FormTemplate, FormField, ApprovalStep, FieldType, UserRole } from '../../../lib/types';

export function PAWBuilder() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);

  // Template form state
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
  });

  const [fields, setFields] = useState<FormField[]>([]);
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [showStepDialog, setShowStepDialog] = useState(false);

  // Field form state
  const [fieldData, setFieldData] = useState<FormField>({
    id: '',
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: [],
    order: 0,
  });

  // Step form state
  const [stepData, setStepData] = useState<ApprovalStep>({
    id: '',
    order: 0,
    roleName: '',
    roleIds: [],
    required: true,
  });

  const loadTemplates = () => {
    const allTemplates = storage.getFormTemplates();
    setTemplates(allTemplates);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateTemplate = () => {
    if (!templateData.name) return;

    const newTemplate: FormTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      fields: fields,
      approvalSteps: approvalSteps,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveFormTemplate(newTemplate);
    resetForm();
    loadTemplates();
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !templateData.name) return;

    const updatedTemplate: FormTemplate = {
      ...editingTemplate,
      name: templateData.name,
      description: templateData.description,
      fields: fields,
      approvalSteps: approvalSteps,
      updatedAt: new Date().toISOString(),
    };

    storage.saveFormTemplate(updatedTemplate);
    resetForm();
    loadTemplates();
  };

  const handleEditTemplate = (template: FormTemplate) => {
    setEditingTemplate(template);
    setTemplateData({
      name: template.name,
      description: template.description || '',
    });
    setFields(template.fields);
    setApprovalSteps(template.approvalSteps);
    setShowEditDialog(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mẫu này?')) {
      storage.deleteFormTemplate(id);
      loadTemplates();
    }
  };

  const resetForm = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setEditingTemplate(null);
    setTemplateData({ name: '', description: '' });
    setFields([]);
    setApprovalSteps([]);
  };

  const handleAddField = () => {
    const newField: FormField = {
      ...fieldData,
      id: `field-${Date.now()}`,
      order: fields.length,
    };
    setFields([...fields, newField]);
    setFieldData({
      id: '',
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: [],
      order: 0,
    });
    setShowFieldDialog(false);
  };

  const handleAddStep = () => {
    const newStep: ApprovalStep = {
      ...stepData,
      id: `step-${Date.now()}`,
      order: approvalSteps.length,
    };
    setApprovalSteps([...approvalSteps, newStep]);
    setStepData({
      id: '',
      order: 0,
      roleName: '',
      roleIds: [],
      required: true,
    });
    setShowStepDialog(false);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleRemoveStep = (id: string) => {
    setApprovalSteps(approvalSteps.filter(s => s.id !== id));
  };

  const renderTemplateForm = () => (
    <>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên mẫu *</Label>
          <Input
            id="name"
            placeholder="Tờ trình mua sắm thiết bị"
            value={templateData.name}
            onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            placeholder="Mô tả mục đích sử dụng mẫu..."
            rows={3}
            value={templateData.description}
            onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
          />
        </div>

        {/* Fields Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Các trường thông tin ({fields.length})</Label>
            <Button size="sm" variant="outline" onClick={() => setShowFieldDialog(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Thêm trường
            </Button>
          </div>
          {fields.length > 0 ? (
            <div className="border rounded-md">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0"
                  style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{field.label}</span>
                      {field.required && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">Bắt buộc</span>
                      )}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{field.type}</span>
                    </div>
                    {field.placeholder && (
                      <p className="text-xs text-muted-foreground mt-0.5">{field.placeholder}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveField(field.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              Chưa có trường thông tin nào
            </p>
          )}
        </div>

        {/* Approval Steps Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Quy trình phê duyệt ({approvalSteps.length} bước)</Label>
            <Button size="sm" variant="outline" onClick={() => setShowStepDialog(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Thêm bước
            </Button>
          </div>
          {approvalSteps.length > 0 ? (
            <div className="border rounded-md">
              {approvalSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0"
                  style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{step.roleName}</span>
                      {step.required && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">Bắt buộc</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.roleIds.map(r => USER_ROLES[r]?.label).join(', ')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveStep(step.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic py-4 text-center">
              Chưa có bước phê duyệt nào
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/staff/paw')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#64748B',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Quay lại danh sách tờ trình
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý mẫu tờ trình</h1>
            <p className="text-muted-foreground mt-1">Tạo và quản lý mẫu tờ trình phê duyệt</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo mẫu mới
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <Card>
        <CardContent className="p-0">
          {templates.length === 0 ? (
            <EmptyState
              title="Chưa có mẫu tờ trình"
              description="Tạo mẫu đầu tiên để bắt đầu sử dụng quy trình phê duyệt"
              action={{
                label: 'Tạo mẫu mới',
                onClick: () => setShowCreateDialog(true),
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên mẫu</TableHead>
                    <TableHead>Số trường</TableHead>
                    <TableHead>Số bước duyệt</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Cập nhật lần cuối</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => {
                    const creator = storage.getUserById(template.createdBy);
                    return (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-muted-foreground mt-0.5 max-w-[300px] truncate">
                              {template.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{template.fields.length}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{template.approvalSteps.length}</span>
                        </TableCell>
                        <TableCell className="text-sm">{formatDateTime(template.createdAt)}</TableCell>
                        <TableCell className="text-sm">{formatDateTime(template.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo mẫu tờ trình mới</DialogTitle>
            <DialogDescription>
              Thiết lập các trường thông tin và quy trình phê duyệt
            </DialogDescription>
          </DialogHeader>

          {renderTemplateForm()}

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Hủy
            </Button>
            <Button onClick={handleCreateTemplate} disabled={!templateData.name}>
              Tạo mẫu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mẫu tờ trình</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin mẫu tờ trình
            </DialogDescription>
          </DialogHeader>

          {renderTemplateForm()}

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Hủy
            </Button>
            <Button onClick={handleUpdateTemplate} disabled={!templateData.name}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Field Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm trường thông tin</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Loại trường *</Label>
              <Select value={fieldData.type} onValueChange={(value) => setFieldData({ ...fieldData, type: value as FieldType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Văn bản</SelectItem>
                  <SelectItem value="textarea">Văn bản dài</SelectItem>
                  <SelectItem value="number">Số</SelectItem>
                  <SelectItem value="date">Ngày tháng</SelectItem>
                  <SelectItem value="select">Lựa chọn</SelectItem>
                  <SelectItem value="checkbox">Hộp kiểm</SelectItem>
                  <SelectItem value="file">Tệp đính kèm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nhãn *</Label>
              <Input
                placeholder="Tên thiết bị"
                value={fieldData.label}
                onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                placeholder="Nhập tên thiết bị..."
                value={fieldData.placeholder}
                onChange={(e) => setFieldData({ ...fieldData, placeholder: e.target.value })}
              />
            </div>

            {fieldData.type === 'select' && (
              <div className="space-y-2">
                <Label>Các tùy chọn (phân cách bằng dấu phẩy)</Label>
                <Input
                  placeholder="Lựa chọn 1, Lựa chọn 2, Lựa chọn 3"
                  value={fieldData.options?.join(', ')}
                  onChange={(e) => setFieldData({ ...fieldData, options: e.target.value.split(',').map(s => s.trim()) })}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={fieldData.required}
                onCheckedChange={(checked) => setFieldData({ ...fieldData, required: checked })}
              />
              <Label>Bắt buộc</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddField} disabled={!fieldData.label}>
              Thêm trường
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm bước phê duyệt</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tên bước *</Label>
              <Input
                placeholder="Trưởng phòng phê duyệt"
                value={stepData.roleName}
                onChange={(e) => setStepData({ ...stepData, roleName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Vai trò được phê duyệt *</Label>
              <Select
                value={stepData.roleIds[0]}
                onValueChange={(value) => setStepData({ ...stepData, roleIds: [value as UserRole] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USER_ROLES)
                    .filter(([key]) => key !== 'supplier')
                    .map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={stepData.required}
                onCheckedChange={(checked) => setStepData({ ...stepData, required: checked })}
              />
              <Label>Bắt buộc</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddStep} disabled={!stepData.roleName || stepData.roleIds.length === 0}>
              Thêm bước
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
