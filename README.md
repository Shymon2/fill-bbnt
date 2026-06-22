# Checklist Nghiệm Thu Sau Sửa Chữa

Ứng dụng web tĩnh, mở trực tiếp trên trình duyệt điện thoại để lập & xuất ảnh phiếu nghiệm thu trụ sạc / tủ đổi pin.

## Cấu trúc

| File | Vai trò |
|------|---------|
| `index.html` | Khung giao diện (HTML) |
| `styles.css` | Toàn bộ CSS, đã tối ưu cho điện thoại (safe-area cho máy tai thỏ) |
| `app.js` | Logic: đăng nhập, danh sách hạng mục, chữ ký, xuất & lưu ảnh |
| `html2canvas.min.js` | Thư viện tạo ảnh từ HTML (bản 1.4.1, để offline cho chắc) |

## Cấu hình nhanh

Mở `app.js`, sửa 2 dòng đầu:

```js
const ACCESS_CODE = "ktv2026";  // mã truy cập chung; để "" nếu không cần mã
const LOGO_URL    = "";         // logo công ty: dán data-URL hoặc link https
```

## Deploy lên GitHub Pages

```bash
git init
git add .
git commit -m "Checklist nghiệm thu - tách css/js/html"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Sau đó vào **Settings → Pages → Build and deployment**, chọn `Deploy from a branch` → branch `main` / thư mục `/ (root)`. Link sẽ có dạng `https://<user>.github.io/<repo>/`. Cần **HTTPS** để chức năng chia sẻ/lưu ảnh hoạt động — GitHub Pages đã có sẵn HTTPS.

## Lưu ảnh trên điện thoại

- **Android (trình duyệt):** bấm **Tải về** → ảnh tải thẳng thành file.
- **iPhone:** bấm **Tải về** → mở bảng chia sẻ → chọn *Lưu ảnh*; hoặc **nhấn giữ vào ảnh** xem trước → *Lưu ảnh*.
- **Trong app (Zalo…):** **nhấn giữ vào ảnh** → *Lưu ảnh*; hoặc mở menu **⋮ → Mở trong trình duyệt** rồi bấm Tải về để lưu thành file.
