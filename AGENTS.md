# Quy tắc riêng cho zeno-api

Đọc `../AGENTS.md` và tài liệu liên quan trong `../docs/` trước khi thay đổi nghiệp vụ hoặc schema. Các quy tắc dưới đây áp dụng thêm cho source API.

## Quy ước model Prisma

- Mọi `model` trong các file `.prisma`, kể cả bảng nối và bảng lịch sử, phải bắt đầu bằng đúng năm trường theo thứ tự: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`. Chỉ sau năm trường này mới khai báo trường nghiệp vụ và quan hệ.
- Khai báo thống nhất:

```prisma
model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  createdBy String?
  updatedAt DateTime @updatedAt
  updatedBy String?

  // Các trường nghiệp vụ và quan hệ đặt bên dưới.
}
```

- `id` của mọi model dùng CUID. Khóa ngoại trỏ tới các model này dùng `String` tương thích CUID; không dùng `@default(uuid())` hoặc `@db.Uuid` cho các khóa đó.
- Bảng nối vẫn có `id` làm khóa chính; giữ ràng buộc `@@unique` trên tổ hợp khóa nghiệp vụ cần duy nhất.
- `createdBy` và `updatedBy` lưu mã người thực hiện khi có ngữ cảnh người dùng; cho phép `null` với thao tác hệ thống hoặc dữ liệu khởi tạo. API phải gán các giá trị này khi thực hiện thao tác có người dùng.
- Khi thêm hoặc sửa model, bảo đảm thứ tự trường trên, ràng buộc quan hệ và tính hợp lệ của toàn bộ schema Prisma trước khi bàn giao.
- Các module CRUD phải đặt tên hàm theo quy ước thống nhất:
  - `createData`: tạo bản ghi.
  - `updateData`: cập nhật thông tin bản ghi.
  - `pagination`: lấy danh sách có phân trang.
  - `detailData`: lấy chi tiết một bản ghi.
  - `deleteData`: xóa mềm một bản ghi bằng cách đặt `isDeleted = true`; mặc định không xóa vật lý khỏi cơ sở dữ liệu. Chỉ xóa vật lý khi người dùng yêu cầu rõ.
  - `loadData`: lấy danh sách tối giản phục vụ dropdown hoặc bộ chọn.
- Các truy vấn `pagination`, `detailData` và `loadData` mặc định chỉ trả bản ghi có `isDeleted = false`. Các truy vấn khác cũng phải loại bản ghi đã xóa khi phù hợp nghiệp vụ.
- Khi tạo bảng/model thuộc module có CRUD, thêm trường `isDeleted Boolean @default(false)` để hỗ trợ xóa mềm; giữ nguyên quy ước năm trường kiểm toán đứng đầu model.
