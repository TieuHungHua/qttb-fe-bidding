# QTTB Implementation Status

Generated: 2026-04-25

## 📊 Tổng quan

| Category | Implemented | Total | Progress |
|----------|-------------|-------|----------|
| **Staff Portal Pages** | 26 | 56 | 46% |
| **Supplier Portal Pages** | 8 | 13 | 62% |
| **Shared Components** | 8 | 15 | 53% |
| **Overall** | **42** | **84** | **50%** |

---

## ✅ Đã implement (38/84)

### 🔷 Staff Portal (22/56)

#### 0. Shared / Layout
- [x] **App Shell — Sidebar + Top Nav** 🔴
- [x] **Login Page** 🔴

#### 1. Dashboard
- [x] **Dashboard — Trang chủ** 🔴

#### 2. Phòng ban
- [x] **Danh sách phòng ban** 🔴 *(MỚI)*
  - DataTable + Search
  - Form tạo/sửa (FormModal)
  - Xóa với ConfirmDialog

#### 3. Danh mục hàng hóa
- [x] **CatalogManagement — Cây danh mục + Danh sách hàng hóa** 🔴 *(MỚI)*
  - Tree view 3 cấp (collapse/expand)
  - CRUD loại/nhóm/hàng hóa
  - FormModal cho tạo/sửa

#### 4. Nhà cung cấp (Staff quản lý)
- [x] **NCC — Danh sách** 🔴 *(MỚI)*
  - DataTable + search + filter trạng thái
  - Form tạo NCC mới
- [x] **NCC — Chi tiết** 🔴 *(MỚI)*
  - 4 tabs: Thông tin / Nhóm hàng / Đánh giá / Đơn đăng ký
  - Score overview (4 chỉ số)
  - Blacklist + Khôi phục với ConfirmDialog

#### 5. Tài khoản NCC (Admin)
- [x] **Tài khoản NCC — Danh sách** 🔴 *(MỚI)*
  - Row highlight vàng cho `pending`
  - Nút Phê duyệt/Từ chối inline
  - ConfirmDialog với lý do

#### 9. Ngân sách năm
- [x] **Ngân sách năm — Danh sách** 🔴
- [x] **Ngân sách năm — Chi tiết** 🔴

#### 11. Kế hoạch mua sắm
- [x] **KHMS — Danh sách** 🔴 *(MỚI)*
  - DataTable + search + filter trạng thái
  - Form tạo
- [x] **KHMS — Chi tiết** 🔴 *(MỚI)*
  - Inline editable table hạng mục
  - Footer tổng giá trị
  - Workflow buttons: Gửi duyệt / Phê duyệt / Từ chối

#### 16. Gói thầu (Luồng chính)
- [x] **Gói thầu — Danh sách** 🔴
- [x] **Gói thầu — Chi tiết (3-column layout)** 🔴
  - 16-step vertical stepper + 8 tabs
  - **[MỚI] HSMT Tab** — phiên bản, soạn thảo, phê duyệt với version control
  - **[MỚI] HĐ Chuyên môn Tab** — Thêm/xóa thành viên + NĐ9 independence validation
  - **[MỚI] HĐ Thẩm định Tab** — Thêm/xóa thành viên + conflict alert
  - **[MỚI] Đánh giá 3 pha Tab** — Sơ bộ → Kỹ thuật → Tài chính → Auto-rank
  - **[MỚI] Khiếu nại Tab** — List + xử lý với destructive alert auto-cancel
  - **[MỚI] Hủy gói thầu** — ConfirmDialog destructive với requireReason

#### 23. Hợp đồng
- [x] **Hợp đồng — Danh sách** 🔴
- [x] **H��p đồng — Chi tiết** 🔴

#### 25. Đơn mua hàng (PO)
- [x] **PO — Danh sách** 🔴
- [x] **PO — Chi tiết** 🔴 *(MỚI)*
  - Progress bars nhận hàng
  - Workflow approve/cancel

#### 26. Phiếu nhập kho
- [x] **Nhập kho — Danh sách** 🔴 *(MỚI)*
  - Form tạo với PO picker
- [x] **Nhập kho — Chi tiết** 🔴 *(MỚI)*
  - Quality badges (Tốt/Lỗi/Thiếu)
  - Quality summary cards
  - Inline edit quality per item
  - ConfirmDialog xác nhận / từ chối

---

### 🟢 Supplier Portal (8/13)

- [x] **Trang đăng ký tài khoản NCC** 🔴
- [x] **App Shell NCC** 🔴
- [x] **Dashboard NCC** 🔴
- [x] **Danh sách gói thầu đang mở** 🔴
- [x] **Chi tiết gói thầu (NCC xem)** 🔴
- [x] **Form nộp HSDT** 🔴
- [x] **Danh sách HSDT của NCC** 🔴
- [x] **Danh sách hợp đồng** 🔴
- [x] **Thông tin tài khoản** 🔴

---

### 🧩 Shared Components (8/15)

- [x] **StatusBadge** 🔴
- [x] **KPICard** 🔴
- [x] **Vertical Stepper 16 bước** 🔴
- [x] **Empty State** 🔴
- [x] **ConfirmDialog** 🔴 *(MỚI)*
  - Warning + Destructive variants
  - requireReason với textarea
- [x] **FormModal** 🔴 *(MỚI)*
  - Sticky header/footer
  - 560px standard / 720px wide
- [x] **AlertBanner** 🔴 *(MỚI)*
  - 4 variants: info/success/warning/error
- [x] **UploadArea** 🔴 *(MỚI)*
  - Drag & drop + file list

---

## ❌ Còn thiếu (46/84)

### 🔴 Quan trọng cấp cao (Must have)

**10. Ngân sách đơn vị**
- [ ] Ngân sách đơn vị — Danh sách
- [ ] Ngân sách đơn vị — Chi tiết (inline editable Budget Lines)
- [ ] Ngân sách đơn vị — Form tạo

**12-15. Đấu thầu đơn giản**
- [ ] Bài đăng thầu (List + Detail + Form)
- [ ] HSDT Staff view
- [ ] Thẩm định hồ sơ
- [ ] Kết quả đấu thầu đơn giản

**17. Hồ sơ mời thầu (HSMT)**
- [ ] HSMT — Danh sách phiên bản
- [ ] HSMT — Chi tiết/soạn thảo

**18. Hội đồng chuyên môn & Thẩm định**
- [ ] Form thêm thành viên với NĐ9 validation
- [ ] Independence warning (red alert)

**19. Đánh giá HSDT (3 pha)**
- [ ] Pha 1: Đánh giá sơ bộ (checklist)
- [ ] Pha 2: Đánh giá kỹ thuật (scoring)
- [ ] Pha 3: Đánh giá tài chính (auto-rank)

**22. Khiếu nại**
- [ ] Danh sách khiếu nại
- [ ] Chi tiết khiếu nại
- [ ] **Xử lý khiếu nại với destructive alert** ⚠️

**23. Hợp đồng**
- [ ] Hợp đồng — Form tạo

**24. Bảo lãnh**
- [ ] Bảo lãnh — Form tạo với 5-10% validation

**25. PO**
- [ ] PO — Form tạo

### 🟡 Quan trọng (Should have)

**20-21. Thẩm định + Công bố**
- [ ] Biên bản thẩm định
- [ ] Phê duyệt BGĐ
- [ ] Công bố kết quả với countdown

**27. Tờ trình PAW**
- [ ] PAW Form Builder (drag-drop)
- [ ] Danh sách tờ trình
- [ ] Chi tiết với WorkflowTimeline
- [ ] Form tạo dynamic

### ⚪ Tùy chọn (Nice to have)

- [ ] 404 / Not Found
- [ ] 403 / Forbidden
- [ ] Session timeout handler
- [ ] Đăng ký nhóm hàng (3-level tree)
- [ ] Đánh giá NCC (4 criteria scoring)
- [ ] Năm tài chính management
- [ ] Supplier: Đăng ký nhóm hàng (self-service)
- [ ] Supplier: Đánh giá của tôi (radar chart)

---

### 🧩 Missing Shared Components (7/15)

**🔴 Critical:**
- [ ] **WorkflowTimeline** — completed/current/future states
- [ ] **Inline Editable Table** reusable — add row / delete row / footer tổng
- [ ] **DataTable** full-featured — pagination + skeleton

**🟡 Important:**
- [ ] **Countdown Timer** — ngày giờ còn lại
- [ ] **Radar Chart** — 4-axis supplier evaluation
- [ ] **Skeleton Loading** — row placeholder
- [ ] **Breadcrumb** — điều hướng

---

## 📈 Progress by Priority

| Priority | Done | Total | % |
|----------|------|-------|---|
| 🔴 Critical | 28 | 48 | 58% |
| 🟡 Important | 6 | 22 | 27% |
| ⚪ Nice-to-have | 2 | 14 | 14% |

---

## 🎯 Đề xuất implement tiếp

### Phase 2: Core Bidding Workflow (Sprint 1)
1. **Complaint Handling** - với destructive alert (xử lý khiếu nại)
2. **3-Phase Evaluation** - scoring + auto-rank
3. **Council Management** - NĐ9 validation
4. **HSMT Management** - version control

### Phase 3: Budget & Procurement (Sprint 2)
5. **Unit Budget** - inline editable Budget Lines
6. **Simple Bidding** - đấu thầu đơn giản
7. **Contract Creation Form**
8. **PO Creation Form**

### Phase 4: Advanced Features (Sprint 3)
9. **PAW Form Builder** - drag-drop (complex)
10. **WorkflowTimeline** shared component
11. **Guarantee Management** - 5-10% validation
12. **Result Announcement** - standstill countdown

---

**Last updated:** 2026-04-25
**Version:** 2.0
**Author:** Claude Code