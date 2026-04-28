# QTTB — UI Feature Checklist for Figma Make

> Dùng file này để kiểm tra từng màn hình đã được thiết kế chưa.
> Đánh dấu `[x]` khi màn hình đã gen xong, `[ ]` khi chưa.
> Mỗi màn hình ghi rõ: tên screen, các thành phần UI bắt buộc, và trạng thái nào cần thể hiện.

---

## 📌 Hướng dẫn đánh dấu

| Ký hiệu | Nghĩa |
|---|---|
| `[ ]` | Chưa gen |
| `[x]` | Đã gen xong |
| `[~]` | Đã gen nhưng chưa đầy đủ |
| `🔴` | Bắt buộc — không thể thiếu |
| `🟡` | Quan trọng — nên có |
| `⚪` | Tùy chọn — có thì tốt |

---

---

# 🔷 STAFF PORTAL

---

## 0. Shared / Layout

- [ ] **App Shell — Sidebar + Top Nav** 🔴
  - Logo + tên hệ thống
  - Navigation items theo module (icon + label)
  - Sidebar expanded (240px) ở ≥1280px
  - Sidebar icon-only (60px) ở 768–1279px
  - Avatar + tên người dùng + nút logout ở dưới cùng
  - Active item highlight

- [ ] **Login Page** 🔴
  - Form email + password
  - Nút "Đăng nhập"
  - Trạng thái error (sai mật khẩu)
  - Loading state khi đang xử lý

- [ ] **404 / Không tìm thấy** 🟡
- [ ] **403 / Không có quyền** 🟡
- [ ] **Session hết hạn → redirect login** 🟡

---

## 1. Dashboard

- [ ] **Dashboard — Trang chủ** 🔴
  - 4 × KPICard: Gói thầu đang mở / Hợp đồng active / NCC đã duyệt / Tổng ngân sách
  - Delta badge ↑/↓ so với tháng trước
  - Biểu đồ cột: giá trị hợp đồng 12 tháng
  - Biểu đồ tròn: phân bổ ngân sách theo phòng ban
  - Bảng "5 gói thầu mới nhất" (tên + trạng thái + ngày tạo)
  - Bảng "5 PO chờ duyệt" (tên + đơn vị + số tiền)

---

## 2. Phòng ban

- [ ] **Danh sách phòng ban** 🔴
  - DataTable: tên, mã, trưởng phòng, ngày tạo
  - Search + nút "Thêm phòng ban"
  - Empty state

- [ ] **Form tạo / sửa phòng ban** 🔴
  - FormModal: tên phòng ban, mã, mô tả
  - Validate required fields

---

## 3. Danh mục hàng hóa

- [ ] **Loại hàng hóa — Danh sách** 🔴
  - DataTable: tên loại, số nhóm con, trạng thái
  - Nút Thêm / Sửa / Xóa
  - Xóa phải kiểm tra ràng buộc → hiện cảnh báo nếu còn nhóm con

- [ ] **Loại hàng hóa — Form tạo/sửa** 🔴
  - FormModal: tên, mã, mô tả

- [ ] **Nhóm hàng hóa — Danh sách** 🔴
  - DataTable: tên nhóm, thuộc loại, số sản phẩm
  - Filter dropdown theo loại
  - Nút Thêm / Sửa / Xóa

- [ ] **Nhóm hàng hóa — Form tạo/sửa** 🔴
  - FormModal: tên, mã, chọn loại (dropdown)

- [ ] **Hàng hóa — Danh sách** 🔴
  - DataTable phân trang: tên, mã, nhóm, loại, đơn vị tính, trạng thái
  - Search + filter theo nhóm / loại
  - Nút Thêm / Sửa / Xóa

- [ ] **Hàng hóa — Form tạo/sửa** 🔴
  - FormModal: tên, mã, chọn nhóm (cascade từ loại → nhóm), đơn vị tính, thông số kỹ thuật (textarea JSON hoặc key-value)

- [ ] **Hàng hóa — Chi tiết** 🟡
  - Thông tin đầy đủ kèm thông số kỹ thuật hiển thị dạng pre-formatted

---

## 4. Nhà cung cấp (Staff quản lý)

- [ ] **NCC — Danh sách** 🔴
  - DataTable phân trang: tên, MST, điểm TB, trạng thái (blacklisted badge đỏ nổi bật)
  - Search + filter trạng thái
  - Nút Thêm NCC

- [ ] **NCC — Chi tiết** 🔴
  - 4 tabs: [Thông tin chung | Nhóm hàng đã duyệt | Lịch sử đánh giá | Đơn đăng ký]
  - Nút Blacklist / Unblacklist + ConfirmDialog bắt buộc nhập lý do
  - Điểm đánh giá hiển thị nổi bật (radar chart hoặc 4 chỉ số)

- [ ] **NCC — Form tạo/sửa** 🔴
  - FormModal: tên, MST, địa chỉ, email, SĐT, người đại diện

---

## 5. Tài khoản NCC (Admin quản lý)

- [ ] **Tài khoản NCC — Danh sách** 🔴
  - DataTable: tên DN, email, trạng thái (`pending` / `approved` / `rejected`)
  - Row highlight vàng cho `pending`
  - Filter theo trạng thái
  - Nút [Phê duyệt][Từ chối][Mở lại] theo conditional visibility

- [ ] **Tài khoản NCC — Chi tiết** 🔴
  - Thông tin đăng ký đầy đủ
  - Action buttons theo trạng thái hiện tại
  - ConfirmDialog khi từ chối (bắt buộc nhập lý do)

---

## 6. Đăng ký nhóm hàng NCC

- [ ] **Đơn đăng ký nhóm hàng — Danh sách** 🔴
  - DataTable: NCC, số nhóm đăng ký, trạng thái, ngày nộp
  - Filter theo trạng thái
  - Badge trạng thái: `draft` / `submitted` / `approved` / `rejected`

- [ ] **Đơn đăng ký — Chi tiết** 🔴
  - Danh sách nhóm hàng được chọn
  - Workflow buttons: [Duyệt][Từ chối] — chỉ hiện khi `submitted`
  - ConfirmDialog khi từ chối

- [ ] **Đơn đăng ký — Form tạo** 🔴
  - Cây danh mục 3 cấp với checkbox chọn nhóm hàng
  - Upload tài liệu năng lực (UploadArea)
  - Nút [Lưu nháp][Nộp đơn]

---

## 7. Đánh giá nhà cung cấp

- [ ] **Đánh giá NCC — Danh sách** 🔴
  - DataTable: NCC, kỳ đánh giá, điểm TB, người đánh giá, ngày
  - Filter theo NCC, kỳ

- [ ] **Đánh giá NCC — Form tạo/sửa** 🔴
  - Chọn NCC (dropdown search)
  - 4 thanh slider / input điểm: Chất lượng / Giá cả / Giao hàng / Dịch vụ hậu mãi (thang 1–10)
  - Điểm tổng tự tính (GENERATED, readonly)
  - Textarea ghi chú

---

## 8. Năm tài chính

- [ ] **Năm tài chính — Danh sách** 🔴
  - DataTable: tên năm, ngày bắt đầu, ngày kết thúc, trạng thái (active/inactive)

- [ ] **Năm tài chính — Form tạo/sửa** 🔴
  - FormModal: tên, ngày bắt đầu, ngày kết thúc, ghi chú

---

## 9. Ngân sách năm

- [ ] **Ngân sách năm — Danh sách** 🔴
  - DataTable: năm tài chính, tổng dự toán, trạng thái
  - Badge workflow: `draft` / `submitted` / `approved` / `rejected`

- [ ] **Ngân sách năm — Chi tiết** 🔴
  - Thẻ tổng: Tổng dự toán / Đã phân bổ / Còn lại (progress bar lớn)
  - Bảng phân bổ theo phòng ban: tên đơn vị, số tiền, % tổng, đã dùng
  - Workflow buttons theo trạng thái: [Gửi duyệt] / [Phê duyệt][Từ chối]

- [ ] **Ngân sách năm — Form tạo/sửa** 🔴
  - FormModal: chọn năm tài chính, tổng dự toán, ghi chú

---

## 10. Ngân sách đơn vị

- [ ] **Ngân sách đơn vị — Danh sách** 🔴
  - DataTable: phòng ban, năm tài chính, tổng ước tính, trạng thái

- [ ] **Ngân sách đơn vị — Chi tiết** 🔴
  - Thông tin header + trạng thái badge
  - Inline editable table Budget Lines: tên mục / số tiền ước tính / ghi chú / nút xóa dòng
  - Footer tổng cộng (sticky nếu bảng dài)
  - Nút [+ Thêm dòng]
  - Workflow buttons theo trạng thái

- [ ] **Ngân sách đơn vị — Form tạo** 🔴
  - Chọn phòng ban, chọn năm tài chính, ghi chú
  - Bảng Budget Lines inline từ đầu (tối thiểu 1 dòng)

---

## 11. Kế hoạch mua sắm

- [ ] **KHMS — Danh sách** 🔴
  - DataTable: tên kế hoạch, phòng ban, năm, tổng ước tính, trạng thái

- [ ] **KHMS — Chi tiết** 🔴
  - Header thông tin
  - Inline editable table hạng mục: tên hàng hóa / SL / đơn giá DK / thành tiền
  - Footer tổng giá trị ước tính
  - Workflow buttons: [Gửi duyệt] / [Phê duyệt][Từ chối] / [Xóa] theo conditional visibility

- [ ] **KHMS — Form tạo** 🔴
  - Chọn phòng ban, năm, ghi chú
  - Bảng hạng mục: search chọn hàng hóa → nhập SL → nhập đơn giá

---

## 12. Đấu thầu đơn giản — Bài đăng thầu

- [ ] **Bài đăng thầu — Danh sách** 🔴
  - DataTable: tiêu đề, hạn nộp, số HSDT, trạng thái
  - Badge: `draft` / `pending_approval` / `approved` / `published` / `cancelled`

- [ ] **Bài đăng thầu — Chi tiết** 🔴
  - Thông tin bài đăng
  - Danh sách hàng hóa yêu cầu (bảng readonly)
  - Danh sách HSDT đã nộp (bảng + trạng thái từng HSDT)
  - Workflow buttons theo trạng thái

- [ ] **Bài đăng thầu — Form tạo/sửa** 🔴
  - FormModal hoặc trang riêng: tiêu đề, mô tả, hạn nộp, hạn hiệu lực
  - Inline table hàng hóa yêu cầu: chọn hàng hóa, SL, đơn vị

---

## 13. Hồ sơ dự thầu (Staff xem)

- [ ] **HSDT — Danh sách** 🔴
  - DataTable: NCC, bài đăng/gói thầu, tổng giá trị, trạng thái, ngày nộp

- [ ] **HSDT — Chi tiết** 🔴
  - Thông tin NCC + tổng giá trị
  - Bảng đơn giá từng hạng mục
  - Tài liệu đính kèm (danh sách file)
  - Trạng thái đánh giá

---

## 14. Thẩm định hồ sơ (Đấu thầu đơn giản)

- [ ] **Thẩm định — Danh sách** 🔴
  - DataTable: HSDT, NCC, điểm kỹ thuật, điểm tài chính, kết quả (pass/fail)

- [ ] **Thẩm định — Form tạo/sửa** 🔴
  - Chọn HSDT
  - Nhập điểm kỹ thuật / tài chính / tổng
  - Kết quả: pass / fail (radio)
  - Ghi chú thẩm định

---

## 15. Kết quả đấu thầu đơn giản

- [ ] **Kết quả — Xem** 🔴
  - NCC thắng thầu + giá trị
  - Các HSDT còn lại và kết quả tương ứng

- [ ] **Kết quả — Form tạo** 🔴
  - Chọn bài đăng thầu → chọn HSDT thắng → xác nhận

---

## 16. Gói thầu (Luồng chính — md_bidding)

- [ ] **Gói thầu — Danh sách** 🔴
  - DataTable phân trang: mã gói, tên, phòng ban, giá trị, trạng thái
  - Filter theo trạng thái, năm
  - Nút "Tạo gói thầu"

- [ ] **Gói thầu — Chi tiết (3-column layout)** 🔴
  - **Cột trái 1/3**: Thông tin cơ bản + Vertical Stepper 15 bước
  - **Cột phải 2/3**: 8 tabs:
    - `[Thông tin]` — thông tin gói thầu đầy đủ
    - `[HSMT]` — lịch sử phiên bản hồ sơ mời thầu
    - `[Hội đồng CM]` — danh sách thành viên tổ chuyên gia
    - `[Hội đồng TĐ]` — danh sách thành viên tổ thẩm định
    - `[Dự thầu]` — danh sách HSDT đã nộp
    - `[Đánh giá]` — kết quả 3 pha đánh giá
    - `[Khiếu nại]` — danh sách khiếu nại + trạng thái
    - `[Lịch sử]` — WorkflowTimeline đầy đủ
  - Action buttons thay đổi theo từng trạng thái
  - Nút Hủy gói thầu màu đỏ + ConfirmDialog bắt buộc lý do

- [ ] **Gói thầu — Form tạo/sửa** 🔴
  - FormModal: mã gói, tên, mô tả, phòng ban, giá trị ước tính, hạn nộp hồ sơ, nguồn vốn

---

## 17. Hồ sơ mời thầu (HSMT)

- [ ] **HSMT — Danh sách phiên bản** 🔴
  - Danh sách phiên bản: số version, ngày tạo, trạng thái, người tạo
  - Nút "Tạo phiên bản mới"

- [ ] **HSMT — Chi tiết / soạn thảo** 🔴
  - Nội dung HSMT (textarea rich text hoặc plain)
  - Danh sách tài liệu đính kèm (UploadArea)
  - Trạng thái phiên bản
  - Nút [Lưu][Gửi phê duyệt]
  - Cảnh báo: không được sửa trong 10 ngày trước hạn nộp hồ sơ

---

## 18. Hội đồng chuyên môn & Thẩm định

- [ ] **Thêm thành viên hội đồng** 🔴
  - Modal chọn nhân viên từ danh sách
  - Ghi chú in đậm: "Hội đồng thẩm định phải độc lập với hội đồng chuyên môn (NĐ9)"
  - Cảnh báo đỏ nếu cùng nhân viên được chọn vào cả hai tổ

- [ ] **Danh sách thành viên hội đồng** 🔴
  - Bảng: tên, chức vụ, vai trò trong HĐ, ngày thêm
  - Nút xóa thành viên

---

## 19. Đánh giá HSDT (3 pha)

- [ ] **Đánh giá sơ bộ** 🔴
  - Bảng HSDT, checkbox đạt/không đạt từng tiêu chí sơ bộ
  - Nút "Hoàn thành pha sơ bộ → chuyển sang kỹ thuật"

- [ ] **Đánh giá kỹ thuật** 🔴
  - Bảng điểm từng HSDT theo tiêu chí kỹ thuật
  - Nhập điểm từng tiêu chí → tự tính tổng
  - Nút "Hoàn thành kỹ thuật → chuyển sang tài chính"

- [ ] **Đánh giá tài chính** 🔴
  - Bảng điểm tài chính từng HSDT
  - Tổng điểm = kỹ thuật + tài chính
  - Nút "Auto-rank" → tự xếp hạng → hiện kết quả xếp hạng
  - NCC xếp hạng 1 được highlight Tertiary 90

---

## 20. Thẩm định kết quả (Phase 9)

- [ ] **Biên bản thẩm định — Xem** 🔴
  - Thông tin tổ thẩm định
  - Kết quả thẩm định + ý kiến
  - Trạng thái phê duyệt của BGĐ

- [ ] **Biên bản thẩm định — Form tạo** 🔴
  - Nội dung biên bản (textarea)
  - Kết luận: đồng ý xếp hạng / yêu cầu xem xét lại
  - Upload tài liệu thẩm định

- [ ] **Phê duyệt biên bản (BGĐ)** 🔴
  - ConfirmDialog: Phê duyệt (→ `reviewed`) hoặc Trả lại (→ `ranked`)
  - Trường nhập ý kiến BGĐ

---

## 21. Công bố kết quả (Phase 10)

- [ ] **Công bố kết quả — Form** 🔴
  - Hiển thị NCC xếp hạng 1 (highlight)
  - Ngày công bố + tự tính standstill end = +10 ngày
  - Countdown hiển thị "Còn X ngày standstill"
  - Nút "Công bố kết quả"

- [ ] **Kết quả gói thầu — Trang xem** 🔴
  - NCC thắng thầu, giá trị, ngày ký dự kiến
  - Danh sách xếp hạng đầy đủ
  - Trạng thái standstill / hết standstill

---

## 22. Khiếu nại (Phase 11)

- [ ] **Khiếu nại — Danh sách** 🔴
  - DataTable: NCC, nội dung tóm tắt, ngày nộp, trạng thái (`pending` / `upheld` / `partially_upheld` / `rejected`)
  - Filter theo gói thầu, trạng thái

- [ ] **Khiếu nại — Chi tiết** 🔴
  - Thông tin NCC + nội dung khiếu nại đầy đủ
  - Tài liệu đính kèm
  - Kết quả xử lý nếu đã có

- [ ] **Xử lý khiếu nại — Form** 🔴
  - Radio 3 lựa chọn: Chấp nhận / Bác bỏ / Chấp nhận một phần
  - **Alert đỏ nổi bật** khi chọn "Chấp nhận": "Chấp nhận khiếu nại sẽ TỰ ĐỘNG HUỶ gói thầu. Hành động này không thể hoàn tác."
  - Textarea lý do bắt buộc
  - ConfirmDialog trước khi submit

---

## 23. Hợp đồng

- [ ] **Hợp đồng — Danh sách** 🔴
  - DataTable: số HĐ, NCC, gói thầu liên kết, giá trị, trạng thái
  - Badge: `active` / `completed` / `terminated`

- [ ] **Hợp đồng — Chi tiết** 🔴
  - 3 tabs: [Lịch thanh toán | Bảo lãnh TH | PO liên kết]
  - Tab lịch thanh toán: bảng đợt thanh toán kèm Badge: Chưa / Đã / Quá hạn
  - Nút [Hoàn thành HĐ][Chấm dứt HĐ] theo trạng thái + ConfirmDialog

- [ ] **Hợp đồng — Form tạo** 🔴
  - Chọn gói thầu (nếu từ md_bidding) → auto-fill NCC + giá trị
  - Số HĐ, ngày ký, ngày hiệu lực, ngày kết thúc
  - Section lịch thanh toán: inline table nhiều đợt (ngày + số tiền + ghi chú)
  - Upload HĐ scan (UploadArea)

---

## 24. Bảo lãnh thực hiện hợp đồng

- [ ] **Bảo lãnh — Danh sách (trong tab HĐ)** 🔴
  - Bảng: ngân hàng, số tiền, ngày hiệu lực, ngày hết hạn, trạng thái
  - Nút "Giải phóng bảo lãnh" + ConfirmDialog

- [ ] **Bảo lãnh — Form tạo** 🔴
  - FormModal: tên ngân hàng, số thư bảo lãnh, số tiền, ngày phát hành, ngày hết hạn
  - Validate: số tiền phải 5–10% giá trị HĐ
  - Upload thư bảo lãnh

---

## 25. Đơn mua hàng (PO)

- [ ] **PO — Danh sách** 🔴
  - DataTable: số PO, HĐ liên kết, NCC, tổng tiền, trạng thái, ngày tạo
  - Badge: `draft` / `pending_approval` / `approved` / `cancelled`

- [ ] **PO — Chi tiết** 🔴
  - Thông tin PO header
  - Bảng items: tên hàng hóa, SL đặt, SL đã nhận, Progress bar nhận hàng, đơn giá, thành tiền
  - Workflow buttons theo trạng thái

- [ ] **PO — Form tạo** 🔴
  - Chọn HĐ → auto-fill NCC
  - Inline table items: chọn hàng hóa (từ HĐ) → nhập SL → đơn giá
  - Footer tổng tiền

---

## 26. Phiếu nhập kho

- [ ] **Nhập kho — Danh sách** 🔴
  - DataTable: số phiếu, PO liên kết, NCC, ngày nhận, trạng thái
  - Badge: `draft` / `confirmed` / `rejected`

- [ ] **Nhập kho — Chi tiết** 🔴
  - Thông tin phiếu
  - Bảng items: hàng hóa, SL theo PO, SL thực nhận, chất lượng (Tốt/Lỗi/Thiếu), ghi chú
  - Alert vàng khi xác nhận: "Xác nhận sẽ cập nhật SL đã nhận trên PO"
  - Badge chất lượng từng dòng
  - Workflow buttons: [Xác nhận][Từ chối] + ConfirmDialog

- [ ] **Nhập kho — Form tạo** 🔴
  - Chọn PO → auto-fill items
  - Inline table: nhập SL thực nhận + chất lượng từng dòng
  - Upload ảnh/biên bản nghiệm thu (UploadArea)

---

## 27. Tờ trình PAW

- [ ] **Cấu hình tờ trình — Danh sách** 🟡
  - DataTable: tên loại tờ trình, số bước, trạng thái active/inactive

- [ ] **PAW Form Builder** 🟡
  - Layout 2 cột: trái = field palette kéo thả (text/number/date/select/textarea/file)
  - Phải = canvas sắp xếp fields + panel cấu hình từng bước duyệt
  - Nút lưu cấu hình

- [ ] **Tờ trình — Danh sách** 🔴
  - DataTable: loại tờ trình, tiêu đề, người tạo, bước hiện tại, trạng thái
  - Filter theo loại, trạng thái

- [ ] **Tờ trình — Chi tiết** 🔴
  - Nội dung tờ trình render động theo cấu hình
  - WorkflowTimeline dọc: avatar + ✅/❌/⏳ + ngày + người xử lý
  - Nút [Chuyển bước tiếp][Từ chối] theo quyền

- [ ] **Tờ trình — Form tạo** 🔴
  - Chọn loại tờ trình → form dynamic render theo cấu hình
  - Upload tài liệu đính kèm

---

---

# 🟢 SUPPLIER PORTAL

---

## S0. Auth & Layout NCC

- [ ] **Trang đăng ký tài khoản NCC (Public)** 🔴
  - Layout: card centered 480px, không có sidebar
  - Background: gradient nhẹ Supplier Primary 90 → Neutral 10
  - Block 1 — Thông tin doanh nghiệp: tên DN, MST (validate unique realtime), địa chỉ, SĐT
  - Block 2 — Tài khoản: email, mật khẩu, xác nhận mật khẩu
  - Divider giữa 2 block
  - Info banner: "Tài khoản sẽ được duyệt trong 1–3 ngày làm việc"
  - Nút "Đăng ký"

- [ ] **Trang đăng nhập NCC** 🔴
  - Card centered, email + mật khẩu
  - Link "Chưa có tài khoản? Đăng ký"
  - Error state (sai thông tin / chưa được duyệt)

- [ ] **App Shell NCC** 🔴
  - Sidebar màu Supplier Primary
  - Navigation: Dashboard / Gói thầu mở / Hồ sơ của tôi / Đăng ký nhóm hàng / Đánh giá / Tài khoản

---

## S1. Dashboard NCC

- [ ] **Dashboard NCC** 🔴
  - 3 KPICard: Gói thầu đang mở / Hồ sơ đã nộp / HĐ đang thực hiện
  - Danh sách 5 gói thầu mới nhất + Badge "Mới" xanh
  - Khu vực thông báo kết quả đấu thầu nổi bật (nếu có)

---

## S2. Gói thầu đang mở

- [ ] **Danh sách gói thầu đang mở** 🔴
  - **Card grid** (không dùng table): mỗi gói = 1 card
  - Card gồm: tên gói thầu, hạn nộp, giá trị ước tính, tags nhóm hàng
  - **Countdown "Còn X ngày Y giờ"** — tạo urgency
  - Nút [Xem chi tiết][Nộp hồ sơ]

- [ ] **Chi tiết gói thầu (NCC xem)** 🔴
  - Thông tin gói thầu, HSMT đính kèm
  - Danh sách hàng hóa yêu cầu
  - Nút [Nộp hồ sơ dự thầu]

---

## S3. Nộp hồ sơ dự thầu

- [ ] **Form nộp HSDT** 🔴
  - Bảng nhập đơn giá từng hạng mục (inline editable)
  - UploadArea: tài liệu năng lực, giấy tờ pháp lý
  - Nút [Lưu nháp][Nộp hồ sơ]
  - Sau khi nộp: form disabled + badge "Đã nộp"
  - Countdown hạn nộp nếu còn thời gian

---

## S4. Hồ sơ của tôi

- [ ] **Danh sách HSDT của NCC** 🔴
  - 2 tabs: [Đấu thầu chính thức | Mời thầu đơn giản]
  - DataTable: tên gói/bài thầu, ngày nộp, giá trị, kết quả
  - Badge kết quả: Trúng thầu (Success) / Không trúng (Secondary) / Chờ kết quả (Tertiary)

---

## S5. Đăng ký nhóm hàng (NCC tự đăng ký)

- [ ] **Đăng ký nhóm hàng** 🔴
  - Cây danh mục 3 cấp: Loại → Nhóm → checkbox chọn
  - Trạng thái từng nhóm: ✅ Đã duyệt / ⏳ Chờ duyệt / Chưa đăng ký
  - UploadArea: tài liệu chứng minh năng lực
  - Nút [Nộp đơn đăng ký]

---

## S6. Đánh giá của tôi (NCC xem)

- [ ] **Đánh giá — Tổng quan** 🔴
  - Radar chart 4 trục: Chất lượng / Giá cả / Đúng hạn / Hậu mãi
  - Điểm trung bình tổng

- [ ] **Đánh giá — Lịch sử** 🔴
  - DataTable: kỳ đánh giá, điểm từng tiêu chí, người đánh giá, ngày

---

## S7. Tài khoản NCC

- [ ] **Thông tin tài khoản** 🔴
  - Avatar upload
  - Thông tin công ty: tên, MST, địa chỉ (MST và tên khóa sau khi đã duyệt lần đầu)
  - Thông tin ngân hàng: ngân hàng, số TK, tên TK
  - Đổi mật khẩu (section riêng)

---

---

# 🧩 SHARED COMPONENTS — Phải gen riêng để reuse

- [ ] **StatusBadge** — tất cả 12 trạng thái 🔴
- [ ] **WorkflowTimeline** — completed / current / future / cancelled 🔴
- [ ] **ConfirmDialog** — warning variant + destructive variant 🔴
- [ ] **FormModal** — standard 560px + wide 720px 🔴
- [ ] **DataTable** — với header bar, striped rows, pagination, empty state, skeleton 🔴
- [ ] **KPICard** — với delta badge ↑/↓ 🔴
- [ ] **Vertical Stepper 15 bước** (Bidding Project) 🔴
- [ ] **UploadArea** — drag & drop + file list 🔴
- [ ] **Inline Editable Table** — add row / delete row / footer tổng 🔴
- [ ] **Alert Banner** — info / success / warning / error 🔴
- [ ] **Countdown Timer** — hiển thị ngày giờ còn lại 🟡
- [ ] **Radar Chart** — 4 trục đánh giá NCC 🟡
- [ ] **Skeleton Loading** — row placeholder 🟡
- [ ] **Empty State** — icon + text + optional CTA 🔴
- [ ] **Breadcrumb** — điều hướng trong module phức tạp 🟡

---

---

# 📊 Tổng kết

## Đếm nhanh

| Portal | Màn hình chính | Màn hình phụ (form/modal) | Tổng |
|---|---|---|---|
| Staff Portal | 38 | 18 | **56** |
| Supplier Portal | 9 | 4 | **13** |
| Shared Components | — | 15 | **15** |
| **Tổng** | | | **84** |

## Thứ tự gen đề xuất

1. **Shared Components** trước — các screen sau dùng lại
2. **Staff: Auth + App Shell + Dashboard**
3. **Staff: Danh mục (M3, M4) + NCC (M5, M6)**
4. **Staff: Ngân sách + KHMS (M9, M10, M11, M12)**
5. **Staff: Đấu thầu đơn giản (M13–M16)**
6. **Staff: Gói thầu chính (M17–M22) — phức tạp nhất**
7. **Staff: Hợp đồng + Kho (M23–M26)**
8. **Staff: PAW (M27)**
9. **Supplier Portal: toàn bộ**

## Màn hình phức tạp nhất — ưu tiên review kỹ

| Màn hình | Lý do phức tạp |
|---|---|
| Gói thầu — Chi tiết | 3-column layout + 8 tabs + Stepper 15 bước + action theo state |
| Xử lý khiếu nại | Alert nguy hiểm + business rule upheld → cancel |
| Đánh giá HSDT 3 pha | Sequential workflow, auto-rank, highlight winner |
| PAW Form Builder | Drag & drop interface |
| Ngân sách đơn vị | Inline editable table + Budget Lines |
