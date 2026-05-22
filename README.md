# Niềm An Vui - Hệ thống Quản lý Điểm danh Khóa Sinh

Một ứng dụng web hiện đại, tốc độ cao được thiết kế chuyên biệt để quản lý và điểm danh khóa sinh cho các đạo tràng, khóa tu. Hệ thống hỗ trợ quét mã QR cực nhanh, quản lý danh sách thông minh và đồng bộ hóa dữ liệu theo thời gian thực.

## 🌟 Tính năng nổi bật

### 1. Bảng điều khiển (Dashboard) Thông minh
- **Tổng quan theo thời gian thực:** Thống kê tỷ lệ hiện diện/vắng mặt, so sánh với ngày hôm trước.
- **Biểu đồ trực quan:** Theo dõi xu hướng đi tu tập qua từng tuần.
- **Quản lý Sinh nhật:** Nhắc nhở sinh nhật khóa sinh theo từng Quý.
- **Ghi chú & Công việc (To-do):** Tạo thông báo và nhắc nhở công việc nội bộ.
- **Phân quyền Quản trị (Admin Manager):** Kiểm soát những ai (qua Google Email) được phép truy cập hệ thống.

### 2. Điểm danh mã QR Siêu tốc
- **Quét trực tiếp qua Camera:** Nhận diện mã QR lập tức bằng thư viện `html5-qrcode`.
- **Tùy biến Camera:** Chuyển đổi linh hoạt giữa Camera trước và Camera sau.
- **Bật đèn Flash:** Hỗ trợ điểm danh ban đêm hoặc trong điều kiện thiếu sáng.
- **Thông báo Mượt mà:** Sử dụng `react-hot-toast` báo hiệu âm thanh/màu sắc (Thành công, Trùng lặp, Lỗi) cực kỳ bắt mắt.

### 3. Quản lý Khóa sinh (Participants)
- **Tìm kiếm & Bộ lọc linh hoạt:** Lọc theo Tên, Pháp danh, Nhóm, hoặc Trạng thái (đã điểm danh/chưa).
- **Phân trang Client-side:** Xử lý danh sách hàng ngàn khóa sinh mượt mà mà không giật lag.
- **Tối ưu Avatar:** Ảnh đại diện tự động được cắt vuông và nén thành định dạng **WebP siêu nhẹ** (100x100), giảm 90% dung lượng lưu trữ trên Firestore.
- **Quản lý chi tiết:** Sửa thông tin, lấy mã QR cá nhân, xem lịch sử điểm danh của từng người.

## 🚀 Công nghệ sử dụng

- **Frontend Core:** React 18, TypeScript, Vite (Tích hợp `React.lazy` để tải trang siêu tốc).
- **Styling & UI:** Tailwind CSS, Lucide React (Icons), Framer Motion (Animations).
- **Backend & Database:** Firebase (Authentication, Firestore Database - Realtime Sync).
- **Utilities:** 
  - `date-fns`: Quản lý múi giờ và tính toán ngày tháng chuẩn xác.
  - `react-hot-toast`: Hệ thống thông báo UI/UX hiện đại.
  - `html5-qrcode`: Xử lý luồng Camera và nhận diện QR.

## 📦 Cài đặt và Chạy nội bộ (Local Development)

### Yêu cầu cấu hình
- Node.js (phiên bản 18+ khuyến nghị)
- Firebase Project (cần tạo dự án trên Firebase Console)

### Các bước cài đặt
1. **Clone repository về máy:**
   ```bash
   git clone <địa-chỉ-repo-github-của-bạn>
   cd NAV-attendance-new
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

3. **Cấu hình Firebase:**
   - Tạo file `firebase-applet-config.json` ở thư mục gốc (ngang hàng với `package.json`).
   - Copy nội dung config từ Firebase Console của bạn vào file này:
     ```json
     {
       "apiKey": "...",
       "authDomain": "...",
       "projectId": "...",
       "storageBucket": "...",
       "messagingSenderId": "...",
       "appId": "..."
     }
     ```

4. **Chạy máy chủ phát triển (Dev Server):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ khả dụng tại `http://localhost:5173` (hoặc cổng hiển thị trong Terminal).

## 🔒 Cơ chế Bảo mật

Hệ thống được thiết kế dưới dạng **Private Portal**. Mọi truy cập vào dữ liệu đều phải đi qua 2 lớp bảo mật:
1. Xác thực Google Account (Đăng nhập).
2. Kiểm tra quyền Admin (Email đăng nhập phải có trong danh sách quản trị viên trên Firestore). Những tài khoản không có quyền sẽ bị từ chối truy cập.

---

*Được phát triển với ❤️ dành riêng cho dự án Niềm An Vui.*
