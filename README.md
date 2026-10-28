# Thư Mời Tốt Nghiệp · Nguyễn Bùi Hoàng Phúc

Trang web thư mời dự lễ tốt nghiệp của Nguyễn Bùi Hoàng Phúc theo phong cách **Kỹ sư Phần mềm hiện đại**, kết hợp tông màu nhận diện sinh viên FPT (**Cam FPT & Xanh Navy**).

> Lễ tốt nghiệp: **Thứ Bảy, 07.11.2026 · 17h** tại Trường Đại học FPT TP.HCM (Lô E2a-7, Đường D1, Khu Công nghệ cao, TP.HCM)

## Tính năng

**Màn mở đầu**
- Bệ đỡ thẻ cử nhân hiện đại. Chọn một thẻ thì thẻ bay ra giữa màn hình, xoay và lật mở ảnh chân dung Tân Cử Nhân 2026.
- Các thẻ còn lại tan thành các hạt công nghệ, bay xếp thành tên chủ nhân buổi lễ.

**Thư mời**
- Lời cảm ơn thầy cô, gia đình và bạn bè.
- 3 cột mốc đáng nhớ: Thời sinh viên tại FPT University, Ngày lễ tốt nghiệp và Khởi đầu hành trình Kỹ sư Phần mềm.
- Album kỷ niệm những khoảnh khắc đáng nhớ.
- Phong bì thư mời trang trọng có đếm ngược ngày lễ (theo giờ Việt Nam) và nút xem đường đi Google Maps.

**Hiệu ứng nền**
- Nền trời đêm công nghệ kèm lưới tọa độ tinh tế, hạt ánh sáng bokeh Cam FPT & Xanh Cyan.

**Khả năng truy cập**
- Responsive tối ưu từ điện thoại đến máy tính.
- Tôn trọng tùy chọn giảm chuyển động (`prefers-reduced-motion`).
- Điều khiển được bằng bàn phím (Tab, Enter, Esc).

## Công nghệ

HTML, CSS và JavaScript thuần, không dùng framework và **không cần bước build**.

- Toàn bộ hình minh họa (nón cử nhân, developer badge, laptop/terminal...) được vẽ bằng **SVG sinh từ code**.
- Hiệu ứng hạt và chữ dùng **Canvas 2D**.
- Font: Baloo 2, Nunito, Mali (Google Fonts, hỗ trợ tiếng Việt).

## Cấu trúc thư mục

```
.
├── index.html          # Bố cục trang và nội dung thư mời
├── css/
│   └── style.css       # Toàn bộ giao diện (Cam FPT & Xanh Navy)
├── js/
│   ├── sprite.js       # Bộ hình SVG: nón cử nhân, thẻ developer, laptop...
│   └── main.js         # Màn mở đầu, hiệu ứng hạt, đếm ngược, khung ảnh
└── assets/
    └── images/         # Ảnh cá nhân: chân dung, trải bài, album
```

## Chạy thử trên máy

Mở trực tiếp file `index.html` bằng trình duyệt, hoặc chạy một server tĩnh:

```bash
npx serve .
# hoặc
python -m http.server 8000
```

## Chỉnh nội dung

| Muốn sửa | Ở đâu |
|----------|-------|
| Lời cảm ơn, thư mời, giờ lễ, địa điểm | `index.html` |
| Giờ lễ và đếm ngược | `js/main.js`: `EV_START`, `EV_END` (giờ UTC) |
| Màu sắc, font | `css/style.css`: biến trong `:root` |

**Về ảnh:** ảnh chính thức nằm trong `assets/images/` và được gắn vào khung qua thuộc tính `data-src` trong `index.html` (ví dụ `data-src="assets/images/chan-dung.jpg"`).

## Tác giả

**Nguyễn Bùi Hoàng Phúc**, Kỹ thuật Phần mềm, Đại học FPT TP.HCM
