# PHP Quiz - Bản tĩnh cho GitHub Pages

Website trắc nghiệm PHP & MySQL đã được chuyển thành HTML, CSS và JavaScript thuần để chạy trên GitHub Pages. Không cần PHP, MySQL, XAMPP hoặc hosting PHP.

## Chức năng
- Ngân hàng 220 câu hỏi trong `questions.json`.
- Mỗi lượt chọn ngẫu nhiên 50 câu không trùng nhau.
- Đảo thứ tự đáp án A/B/C/D ở từng câu.
- Thu thập họ tên, lớp và mã học sinh (không bắt buộc).
- Chấm điểm tự động theo thang 10 (mỗi câu đúng 0,2 điểm).
- Xem lại câu trả lời, đáp án đúng và câu bỏ trống sau khi nộp.
- Trang giáo viên có lọc lớp, thống kê, xem chi tiết và xuất CSV.

## Cài lên GitHub Pages
1. Tạo repository trên GitHub (ví dụ `php-quiz-website`).
2. Tải **toàn bộ nội dung bên trong thư mục này** lên thư mục gốc repository. File `index.html` phải nằm ngay ở thư mục gốc, không nằm trong một thư mục con.
3. Mở **Settings → Pages**.
4. Trong **Build and deployment**, chọn **Deploy from a branch**.
5. Chọn branch `main`, folder `/(root)`, rồi nhấn **Save**.
6. Chờ GitHub triển khai và mở đường dẫn Pages được hiển thị trong mục Pages.

## Đường dẫn
- Học sinh: `https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/`
- Giáo viên: `https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/teacher.html`

## Dữ liệu và giới hạn quan trọng
Bản GitHub Pages này không có máy chủ và không có database trung tâm. Kết quả được lưu trong `localStorage` của trình duyệt đang làm bài. Vì vậy:
- Giáo viên chỉ thấy kết quả được tạo trên cùng trình duyệt/thiết bị đó.
- Học sinh làm bài trên điện thoại hoặc máy tính riêng sẽ không tự gửi điểm về máy giáo viên.
- Xóa dữ liệu trình duyệt có thể làm mất kết quả đã lưu.
- Không dùng bản này để thu thập dữ liệu cá nhân nhạy cảm hoặc làm bài thi chính thức cần kiểm soát gian lận.

Trang giáo viên có khóa giao diện mặc định `admin` / `Admin@123`, được khai báo ở đầu `assets/teacher.js`. Đây **không phải bảo mật thật**: ai xem mã JavaScript cũng có thể đọc được. Chỉ dùng để ẩn giao diện quản trị đơn giản trên bản demo; không lưu dữ liệu nhạy cảm. Muốn quản lý tập trung và bảo mật, cần backend/database như Firebase hoặc Supabase có quy tắc bảo mật.

## Tệp chính
- `index.html`: trang làm bài.
- `teacher.html`: trang quản trị kết quả trên thiết bị hiện tại.
- `questions.json`: ngân hàng 220 câu hỏi và đáp án.
- `assets/app.js`: logic thi, chấm điểm, lưu và xem lại bài.
- `assets/teacher.js`: bảng điểm, lọc, chi tiết và xuất CSV.
- `assets/style.css`: giao diện.

## Kiểm tra khi chạy
Có thể mở `index.html` bằng một máy chủ tĩnh hoặc GitHub Pages. Một số trình duyệt chặn `fetch()` đọc `questions.json` khi mở file bằng đường dẫn `file://`; nên chạy qua GitHub Pages hoặc máy chủ tĩnh local.


## Khắc phục lỗi Failed to fetch khi bắt đầu thi

Khi học sinh nhấn Bắt đầu làm bài, trình duyệt tải `questions.json`. Nếu gặp lỗi, kiểm tra:

1. `questions.json` nằm cùng cấp với `index.html` ở thư mục gốc được GitHub Pages publish.
2. Tên file chính xác là `questions.json` (chữ thường), không phải `Questions.json` hoặc `questions.json.txt`.
3. Repository đã có đủ `index.html`, `questions.json` và thư mục `assets/`.
4. GitHub → Settings → Pages đang publish branch `main`, folder `/(root)` (nếu tải file ở root). Chờ trạng thái deployment thành công.
5. Mở trực tiếp `https://TEN-GITHUB.github.io/TEN-REPOSITORY/questions.json`. Trình duyệt phải hiển thị dữ liệu JSON bắt đầu bằng `[` và có 220 câu. Nếu hiện 404 thì file đang sai vị trí hoặc chưa được publish.
6. Mở website qua địa chỉ HTTPS của GitHub Pages, không mở `index.html` bằng cách nhấp đúp trên máy tính.

Phiên bản cập nhật sẽ hiển thị URL và nguyên nhân cụ thể hơn thay vì chỉ báo `Failed to fetch`.
