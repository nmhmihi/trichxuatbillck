# Trích Xuất Bill Ngân Hàng (Bank Bill OCR AI)

Ứng dụng full-stack sử dụng **React (Vite) + Tailwind CSS** và **Node.js (Express) + Google Gemini AI (gemini-3.1-flash-lite)** để tự động trích xuất thông tin người nhận tiền từ ảnh biên lai / bill chuyển khoản ngân hàng:
- **Dòng 1**: Tên người nhận (Họ và tên thụ hưởng)
- **Dòng 2**: Số tài khoản / Số thẻ người nhận
- **Dòng 3**: Tên ngân hàng người nhận

---

## ⚠️ Lưu ý quan trọng khi xuất mã nguồn ra dùng ngoài Web:

Ứng dụng này là **Full-Stack (có máy chủ Node.js Express)**:
1. **Lý do có máy chủ backend**: Để bảo mật khóa `GEMINI_API_KEY` ở phía máy chủ, không để lộ khóa API ra trình duyệt của người dùng.
2. **Không thể triển khai dạng Web tĩnh thuần (Static-only)**: Nếu bạn chỉ đưa thư mục `dist/` lên GitHub Pages, Vercel (chế độ tĩnh), Netlify (chế độ tĩnh) hoặc hosting cPanel PHP thông thường, trình duyệt sẽ không tìm thấy API `/api/extract-bill` (báo lỗi 404).

---

## Hướng dẫn chạy và sử dụng:

### 1. Chạy trên máy tính cá nhân (Localhost)

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

2. Tạo file `.env` ở thư mục gốc và điền khóa Gemini API của bạn:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *(Bạn có thể lấy khóa miễn phí tại: [Google AI Studio](https://aistudio.google.com/apikey))*

3. Khởi động môi trường phát triển:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại: `http://localhost:3000`

4. Chạy chế độ Production (Production Server):
   ```bash
   npm run build
   npm start
   ```

---

### 2. Triển khai lên môi trường Web bên ngoài

Để ứng dụng hoạt động trên internet bên ngoài Google AI Studio, bạn có thể triển khai lên bất kỳ nền tảng nào hỗ trợ Node.js hoặc Docker:

- **Google Cloud Run** (Khuyên dùng - tương thích mặc định với AI Studio)
- **Render.com / Railway.app / Fly.io / Heroku**:
  - Build command: `npm run build`
  - Start command: `npm start`
  - Biến môi trường (Environment Variables): thêm `GEMINI_API_KEY=...`
- **Máy chủ VPS (Ubuntu, Nginx + PM2)**:
  - Chạy `npm run build`
  - Chạy `pm2 start dist/server.cjs --name "bill-ocr"`
  - Cấu hình Nginx reverse proxy trỏ port 3000 ra domain của bạn.

---

### 3. Chia sẻ nhanh trực tiếp từ Google AI Studio (Không cần xuất mã nguồn)
Nếu bạn muốn gửi link cho người khác dùng ngay mà không cần thuê hosting:
1. Nhìn lên góc trên bên phải màn hình **Google AI Studio**.
2. Bấm vào nút **Share** (Chia sẻ) hoặc **Deploy** (Triển khai).
3. Chọn quyền công khai (Public) để tạo đường dẫn web dùng chung (Shared URL).
*(Lưu ý: Không gửi link `ais-dev-...` vì đó là link phát triển nội bộ chỉ tài khoản của bạn mới mở được).*
