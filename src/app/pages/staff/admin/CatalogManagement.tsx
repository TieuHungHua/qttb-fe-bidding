import { useState } from 'react';
import { Package, Plus, Pencil, Trash2, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { FormModal } from '../../../components/shared/FormModal';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { generateId } from '../../../lib/utils';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  code: string;
  level: 1 | 2 | 3;
  parentId?: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  unit: string;
  estimatedPrice?: number;
  description?: string;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Thiết bị Công nghệ thông tin', code: 'CNTT', level: 1 },
  { id: 'cat-2', name: 'Máy tính & Ngoại vi', code: 'CNTT-MT', level: 2, parentId: 'cat-1' },
  { id: 'cat-3', name: 'Thiết bị mạng', code: 'CNTT-MG', level: 2, parentId: 'cat-1' },
  { id: 'cat-4', name: 'Thiết bị thí nghiệm', code: 'TNTB', level: 1 },
  { id: 'cat-5', name: 'Dụng cụ thủy tinh', code: 'TNTB-TT', level: 2, parentId: 'cat-4' },
  { id: 'cat-6', name: 'Sách & Tài liệu', code: 'SACH', level: 1 },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Máy tính để bàn Dell OptiPlex 7090', code: 'MT-DELL-7090', categoryId: 'cat-2', unit: 'bộ', estimatedPrice: 20000000, description: 'CPU i5-10500, RAM 8GB, SSD 256GB' },
  { id: 'prod-2', name: 'Màn hình Dell 24 inch', code: 'MH-DELL-24', categoryId: 'cat-2', unit: 'cái', estimatedPrice: 5000000, description: 'Full HD, IPS Panel' },
  { id: 'prod-3', name: 'Phần mềm Microsoft Office 365', code: 'SW-O365', categoryId: 'cat-2', unit: 'license', estimatedPrice: 2000000 },
  { id: 'prod-4', name: 'Kính hiển vi điện tử', code: 'TN-KHV', categoryId: 'cat-5', unit: 'bộ', estimatedPrice: 300000000 },
  { id: 'prod-5', name: 'Bộ thí nghiệm hóa học', code: 'TN-HOACH', categoryId: 'cat-5', unit: 'bộ', estimatedPrice: 50000000 },
];

const CAT_KEY = 'qttb_categories';
const PROD_KEY = 'qttb_products';

function getCategories(): Category[] {
  const raw = localStorage.getItem(CAT_KEY);
  if (!raw) { localStorage.setItem(CAT_KEY, JSON.stringify(INITIAL_CATEGORIES)); return INITIAL_CATEGORIES; }
  return JSON.parse(raw);
}
function saveCategories(c: Category[]) { localStorage.setItem(CAT_KEY, JSON.stringify(c)); }

function getProducts(): Product[] {
  const raw = localStorage.getItem(PROD_KEY);
  if (!raw) { localStorage.setItem(PROD_KEY, JSON.stringify(INITIAL_PRODUCTS)); return INITIAL_PRODUCTS; }
  return JSON.parse(raw);
}
function saveProducts(p: Product[]) { localStorage.setItem(PROD_KEY, JSON.stringify(p)); }

const formatCurrency = (v?: number) =>
  v ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '—';

export function CatalogManagement() {
  const [activeView, setActiveView] = useState<'categories' | 'products'>('categories');
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['cat-1', 'cat-4', 'cat-6']));

  // Modals
  const [catModal, setCatModal] = useState<{ open: boolean; editing?: Category; parentId?: string }>({ open: false });
  const [prodModal, setProdModal] = useState<{ open: boolean; editing?: Product }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'cat' | 'prod'; id: string; name: string } | null>(null);

  // Forms
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '', parentId: '', level: '1' as '1' | '2' | '3' });
  const [prodForm, setProdForm] = useState({ name: '', code: '', categoryId: '', unit: '', estimatedPrice: '', description: '' });
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});
  const [prodErrors, setProdErrors] = useState<Record<string, string>>({});

  const reload = () => {
    setCategories(getCategories());
    setProducts(getProducts());
  };

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const rootCats = categories.filter(c => !c.parentId);
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCatCreate = (parentId?: string, level: '1' | '2' | '3' = '1') => {
    setCatModal({ open: true });
    setCatForm({ name: '', code: '', description: '', parentId: parentId ?? '', level });
    setCatErrors({});
  };

  const handleCatSubmit = () => {
    const e: Record<string, string> = {};
    if (!catForm.name.trim()) e.name = 'Bắt buộc';
    if (!catForm.code.trim()) e.code = 'Bắt buộc';
    if (Object.keys(e).length > 0) { setCatErrors(e); return; }

    const all = getCategories();
    if (catModal.editing) {
      const idx = all.findIndex(c => c.id === catModal.editing!.id);
      if (idx !== -1) all[idx] = { ...all[idx], name: catForm.name, code: catForm.code, description: catForm.description || undefined };
    } else {
      all.push({
        id: generateId('cat'),
        name: catForm.name,
        code: catForm.code,
        level: Number(catForm.level) as 1 | 2 | 3,
        parentId: catForm.parentId || undefined,
        description: catForm.description || undefined,
      });
    }
    saveCategories(all);
    reload();
    setCatModal({ open: false });
    toast.success(catModal.editing ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới');
  };

  const handleProdSubmit = () => {
    const e: Record<string, string> = {};
    if (!prodForm.name.trim()) e.name = 'Bắt buộc';
    if (!prodForm.code.trim()) e.code = 'Bắt buộc';
    if (!prodForm.categoryId) e.categoryId = 'Bắt buộc';
    if (!prodForm.unit.trim()) e.unit = 'Bắt buộc';
    if (Object.keys(e).length > 0) { setProdErrors(e); return; }

    const all = getProducts();
    if (prodModal.editing) {
      const idx = all.findIndex(p => p.id === prodModal.editing!.id);
      if (idx !== -1) all[idx] = { ...all[idx], ...prodForm, estimatedPrice: prodForm.estimatedPrice ? Number(prodForm.estimatedPrice) : undefined };
    } else {
      all.push({
        id: generateId('prod'),
        name: prodForm.name,
        code: prodForm.code,
        categoryId: prodForm.categoryId,
        unit: prodForm.unit,
        estimatedPrice: prodForm.estimatedPrice ? Number(prodForm.estimatedPrice) : undefined,
        description: prodForm.description || undefined,
      });
    }
    saveProducts(all);
    reload();
    setProdModal({ open: false });
    toast.success(prodModal.editing ? 'Đã cập nhật hàng hóa' : 'Đã thêm hàng hóa mới');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'cat') {
      saveCategories(getCategories().filter(c => c.id !== deleteTarget.id && c.parentId !== deleteTarget.id));
      toast.success('Đã xóa danh mục');
    } else {
      saveProducts(getProducts().filter(p => p.id !== deleteTarget.id));
      toast.success('Đã xóa hàng hóa');
    }
    reload();
    setDeleteTarget(null);
  };

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name ?? '—';

  const renderCatTree = (parent: string | undefined = undefined, depth = 0) => {
    const cats = categories.filter(c => c.parentId === parent && !c.parentId || (parent && c.parentId === parent));
    const list = parent ? categories.filter(c => c.parentId === parent) : categories.filter(c => !c.parentId);
    return list.map(cat => {
      const children = categories.filter(c => c.parentId === cat.id);
      const isExpanded = expandedCats.has(cat.id);
      return (
        <div key={cat.id}>
          <div
            className="flex items-center group hover:bg-[#F1F5F9] transition-colors rounded-md"
            style={{ paddingLeft: `${depth * 20 + 12}px`, paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px' }}
          >
            {children.length > 0 ? (
              <button onClick={() => toggleExpand(cat.id)} className="mr-1 p-0.5 rounded hover:bg-gray-200 transition-colors">
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" style={{ color: '#64748B' }} /> : <ChevronRight className="h-3.5 w-3.5" style={{ color: '#64748B' }} />}
              </button>
            ) : (
              <span style={{ width: '20px', display: 'inline-block', flexShrink: 0 }} />
            )}
            <div className="flex-1 min-w-0">
              <span style={{ fontSize: depth === 0 ? '14px' : '13px', fontWeight: depth === 0 ? 600 : 400, color: '#1E293B' }}>{cat.name}</span>
              <span style={{ marginLeft: '8px', fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace", color: '#64748B', backgroundColor: '#F1F5F9', padding: '0 4px', borderRadius: '3px' }}>{cat.code}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {depth < 2 && (
                <button
                  onClick={() => { openCatCreate(cat.id, String(depth + 2) as '2' | '3'); }}
                  className="p-1 rounded hover:bg-blue-100 transition-colors"
                  title="Thêm nhóm con"
                >
                  <Plus className="h-3.5 w-3.5" style={{ color: '#1D4ED8' }} />
                </button>
              )}
              <button
                onClick={() => { setCatModal({ open: true, editing: cat }); setCatForm({ name: cat.name, code: cat.code, description: cat.description ?? '', parentId: cat.parentId ?? '', level: String(cat.level) as '1' | '2' | '3' }); setCatErrors({}); }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Sửa"
              >
                <Pencil className="h-3.5 w-3.5" style={{ color: '#475569' }} />
              </button>
              <button
                onClick={() => setDeleteTarget({ type: 'cat', id: cat.id, name: cat.name })}
                className="p-1 rounded hover:bg-red-50 transition-colors"
                title="Xóa"
              >
                <Trash2 className="h-3.5 w-3.5" style={{ color: '#DC2626' }} />
              </button>
            </div>
          </div>
          {isExpanded && children.length > 0 && (
            <div>{renderCatTree(cat.id, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E293B' }}>Danh mục hàng hóa</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Quản lý loại, nhóm hàng và danh sách thiết bị</p>
        </div>
        <div className="flex items-center gap-2">
          {activeView === 'categories' ? (
            <Button onClick={() => openCatCreate()} style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus className="h-4 w-4" /> Thêm loại hàng
            </Button>
          ) : (
            <Button onClick={() => { setProdModal({ open: true }); setProdForm({ name: '', code: '', categoryId: '', unit: '', estimatedPrice: '', description: '' }); setProdErrors({}); }} style={{ backgroundColor: '#1D4ED8', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: 500, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus className="h-4 w-4" /> Thêm hàng hóa
            </Button>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 mb-5" style={{ backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
        {[{ key: 'categories', label: 'Cây danh mục' }, { key: 'products', label: 'Danh sách hàng hóa' }].map(v => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key as any)}
            style={{
              padding: '7px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: activeView === v.key ? 600 : 400,
              backgroundColor: activeView === v.key ? '#FFFFFF' : 'transparent',
              color: activeView === v.key ? '#1E293B' : '#64748B',
              boxShadow: activeView === v.key ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
              transition: 'all 80ms', cursor: 'pointer',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {activeView === 'categories' && (
        <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>Cây phân loại 3 cấp</h2>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Loại → Nhóm → Phân nhóm</p>
          </div>
          <div style={{ padding: '8px 4px' }}>
            {categories.filter(c => !c.parentId).length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                <Package className="h-10 w-10 mx-auto mb-3" />
                <p style={{ fontSize: '14px' }}>Chưa có danh mục nào</p>
              </div>
            ) : (
              renderCatTree()
            )}
          </div>
        </div>
      )}

      {activeView === 'products' && (
        <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
          <div className="flex items-center gap-3" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <div className="relative" style={{ minWidth: '240px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
              <Input
                placeholder="Tìm tên hoặc mã hàng hóa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
              />
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>{filteredProducts.length} hàng hóa</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9' }}>
                  {['#', 'Tên hàng hóa', 'Mã', 'Danh mục', 'Đơn vị', 'Đơn giá DK', ''].map((h, i) => (
                    <th key={i} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', padding: '10px 16px', textAlign: i === 5 ? 'right' : 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: '14px' }}>Không có hàng hóa phù hợp.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p, idx) => (
                    <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #F1F5F9' }} className="group">
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: '#64748B', width: '40px' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>{p.name}</p>
                        {p.description && <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{p.description}</p>}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>{p.code}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{getCatName(p.categoryId)}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: '#475569' }}>{p.unit}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: '#334155', textAlign: 'right', fontFamily: "'IBM Plex Mono', monospace" }}>{formatCurrency(p.estimatedPrice)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <button
                            onClick={() => { setProdModal({ open: true, editing: p }); setProdForm({ name: p.name, code: p.code, categoryId: p.categoryId, unit: p.unit, estimatedPrice: p.estimatedPrice ? String(p.estimatedPrice) : '', description: p.description ?? '' }); setProdErrors({}); }}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" style={{ color: '#475569' }} />
                          </button>
                          <button onClick={() => setDeleteTarget({ type: 'prod', id: p.id, name: p.name })} className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Xóa">
                            <Trash2 className="h-3.5 w-3.5" style={{ color: '#DC2626' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <FormModal
        open={catModal.open}
        onClose={() => setCatModal({ open: false })}
        onSubmit={handleCatSubmit}
        title={catModal.editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        submitLabel={catModal.editing ? 'Cập nhật' : 'Thêm'}
      >
        <div className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Tên danh mục <span style={{ color: '#DC2626' }}>*</span></label>
            <Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="Tên loại/nhóm hàng" style={{ fontSize: '14px', borderColor: catErrors.name ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }} />
            {catErrors.name && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{catErrors.name}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Mã <span style={{ color: '#DC2626' }}>*</span></label>
            <Input value={catForm.code} onChange={e => setCatForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="VD: CNTT" style={{ fontSize: '14px', fontFamily: "'IBM Plex Mono', monospace", borderColor: catErrors.code ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }} />
            {catErrors.code && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{catErrors.code}</p>}
          </div>
          {!catModal.editing && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Thuộc danh mục cha</label>
              <select value={catForm.parentId} onChange={e => setCatForm(f => ({ ...f, parentId: e.target.value }))} style={{ width: '100%', fontSize: '14px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '9px 12px', backgroundColor: '#FFFFFF', color: '#1E293B' }}>
                <option value="">— Cấp cao nhất (Loại hàng) —</option>
                {categories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Mô tả</label>
            <textarea value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ width: '100%', fontSize: '14px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '9px 12px', resize: 'vertical', outline: 'none', color: '#1E293B' }} />
          </div>
        </div>
      </FormModal>

      {/* Product Modal */}
      <FormModal
        open={prodModal.open}
        onClose={() => setProdModal({ open: false })}
        onSubmit={handleProdSubmit}
        title={prodModal.editing ? 'Sửa hàng hóa' : 'Thêm hàng hóa mới'}
        submitLabel={prodModal.editing ? 'Cập nhật' : 'Thêm'}
      >
        <div className="space-y-4">
          {[
            { field: 'name', label: 'Tên hàng hóa', placeholder: 'VD: Máy tính Dell OptiPlex 7090', required: true },
            { field: 'code', label: 'Mã hàng hóa', placeholder: 'VD: MT-DELL-7090', required: true, mono: true },
            { field: 'unit', label: 'Đơn vị tính', placeholder: 'VD: bộ, cái, license', required: true },
            { field: 'estimatedPrice', label: 'Đơn giá ước tính (VNĐ)', placeholder: 'VD: 20000000', required: false, type: 'number' },
          ].map(({ field, label, placeholder, required, mono, type }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
                {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
              </label>
              <Input
                type={type ?? 'text'}
                value={prodForm[field as keyof typeof prodForm]}
                onChange={e => setProdForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                style={{ fontSize: '14px', fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined, borderColor: prodErrors[field] ? '#DC2626' : '#CBD5E1', borderRadius: '6px' }}
              />
              {prodErrors[field] && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{prodErrors[field]}</p>}
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Nhóm hàng <span style={{ color: '#DC2626' }}>*</span></label>
            <select value={prodForm.categoryId} onChange={e => setProdForm(f => ({ ...f, categoryId: e.target.value }))} style={{ width: '100%', fontSize: '14px', border: `1px solid ${prodErrors.categoryId ? '#DC2626' : '#CBD5E1'}`, borderRadius: '6px', padding: '9px 12px', backgroundColor: '#FFFFFF', color: '#1E293B' }}>
              <option value="">— Chọn nhóm hàng —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{'  '.repeat(c.level - 1)}{c.name}</option>)}
            </select>
            {prodErrors.categoryId && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{prodErrors.categoryId}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>Mô tả / Thông số kỹ thuật</label>
            <textarea value={prodForm.description} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="VD: CPU i5, RAM 8GB, SSD 256GB..." style={{ width: '100%', fontSize: '14px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '9px 12px', resize: 'vertical', outline: 'none', color: '#1E293B' }} />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget?.type === 'cat' ? 'Xóa danh mục' : 'Xóa hàng hóa'}
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        variant="destructive"
        confirmLabel="Xóa"
      />
    </div>
  );
}
