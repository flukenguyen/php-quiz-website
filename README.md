# PHP Quiz – Website trắc nghiệm PHP & MySQL

Website PHP + MySQL sử dụng ngân hàng 220 câu trắc nghiệm được trích từ PDF người dùng cung cấp.

## Chức năng
- Học sinh nhập họ tên, lớp, mã học sinh (mã không bắt buộc).
- Mỗi lượt lấy ngẫu nhiên 50/220 câu; thứ tự câu và đáp án A/B/C/D được đảo.
- Chấm điểm phía máy chủ, 0,2 điểm/câu đúng, thang điểm 10.
- Lưu kết quả, số câu đúng/sai, thời gian và chi tiết câu trả lời.
- Giáo viên đăng nhập, lọc lớp, xem thống kê, xem chi tiết bài làm và xuất CSV mở được bằng Excel.

## Cài đặt trên XAMPP (Windows)
1. Cài XAMPP, bật **Apache** và **MySQL**.
2. Chép nguyên thư mục `php_quiz_website` vào `C:\xampp\htdocs\`.
3. Mở `http://localhost/phpmyadmin` → tab **Import** → chọn file `database.sql` trong thư mục dự án → Import.
4. Mở `config.php`, kiểm tra `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` theo máy. XAMPP mặc định thường là `localhost`, `php_quiz`, `root`, mật khẩu rỗng.
5. Truy cập `http://localhost/php_quiz_website/` để học sinh làm bài.
6. Giáo viên truy cập `http://localhost/php_quiz_website/teacher.php`.

## Tài khoản giáo viên mặc định
- Tên đăng nhập: `admin`
- Mật khẩu: `Admin@123`

**Bảo mật:** đổi mật khẩu mặc định trước khi đưa website lên mạng. Có thể tạo hash mới bằng lệnh PHP:

```bash
php -r "echo password_hash('MatKhauMoi', PASSWORD_DEFAULT), PHP_EOL;"
```

Sau đó cập nhật cột `teachers.password_hash` cho tài khoản `admin` trong phpMyAdmin. Không nên dùng tài khoản mặc định khi triển khai công khai.

## Đưa website lên hosting
- Hosting cần hỗ trợ PHP 8.0+ và MySQL/MariaDB.
- Upload toàn bộ thư mục dự án lên hosting, tạo database và import `database.sql`.
- Sửa thông tin database trong `config.php` theo thông tin hosting.
- Truy cập domain đã trỏ về thư mục dự án.
- Bật HTTPS trước khi cho học sinh nhập thông tin.

## Ghi chú về ngân hàng câu hỏi
- Ngân hàng có 220 câu, giữ nguyên nội dung và đáp án theo tài liệu PDF đầu vào, gồm cả cách viết/thuật ngữ gốc của tài liệu.
- Một số câu trong PDF có lỗi định dạng hoặc lỗi đánh số ở bản gốc; câu bị đánh số nhầm “Câu 38” trong phần gần cuối đã được đưa về vị trí câu 188 theo thứ tự nội dung.
- Giáo viên nên rà soát nội dung/đáp án trước khi dùng làm bài kiểm tra chính thức.
- Mỗi lượt thi lấy 50 câu không trùng nhau trong chính lượt đó. Các lượt thi khác nhau có thể trùng câu.

## Cấu trúc
- `index.php`: giao diện học sinh.
- `teacher.php`: giao diện giáo viên.
- `api.php`: xử lý tạo đề, chấm điểm, đăng nhập, lưu và xuất kết quả.
- `config.php`: cấu hình kết nối MySQL và phiên làm việc.
- `database.sql`: tạo cơ sở dữ liệu và tài khoản giáo viên ban đầu.
- `questions.json`: ngân hàng 220 câu hỏi.
- `assets/`: CSS và JavaScript.
