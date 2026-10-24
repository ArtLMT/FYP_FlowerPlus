/**
 * Shared Vietnamese error wording. Every storefront request falls back to these, so one backend
 * error code reads the same on every screen. Services add or override messages per call.
 */

export const NETWORK_MESSAGE = "Không thể kết nối máy chủ. Vui lòng thử lại.";
export const SIGN_IN_MESSAGE = "Vui lòng đăng nhập để tiếp tục.";
export const VIEW_DENIED_MESSAGE = "Tài khoản của bạn không có quyền xem nội dung này.";

export const requestFailed = (status: number) => `Yêu cầu không thành công (${status}).`;

export const COMMON_CODES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  EMAIL_ALREADY_EXISTS: "Email này đã được đăng ký.",
  OTP_INVALID: "Mã xác thực không đúng hoặc đã hết hạn.",
  OTP_ATTEMPTS_EXCEEDED: "Bạn đã nhập sai mã quá nhiều lần. Vui lòng yêu cầu mã mới.",
  OTP_THROTTLED: "Vui lòng đợi trước khi yêu cầu mã mới.",
  OTP_DAILY_LIMIT_REACHED: "Đã vượt giới hạn gửi mã trong ngày.",
  ACCESS_DENIED: "Tài khoản của bạn không có quyền thực hiện thao tác này.",
  // Addresses
  ADDRESS_NOT_FOUND: "Địa chỉ không còn tồn tại. Vui lòng tải lại sổ địa chỉ.",
  ADDRESS_LIMIT_REACHED: "Bạn có thể lưu tối đa 20 địa chỉ.",
  // Materials
  MATERIAL_NAME_EXISTS: "Tên nguyên liệu này đã được sử dụng.",
  MATERIAL_NOT_FOUND: "Không tìm thấy nguyên liệu.",
  MATERIAL_IN_USE: "Không thể đổi loại hoặc đơn vị vì nguyên liệu đang được sử dụng.",
  CONCURRENT_MODIFICATION: "Nguyên liệu đã được cập nhật bởi người khác. Danh sách đã được làm mới; hãy xem lại trước khi lưu tiếp.",
  VALIDATION_FAILED: "Một số thông tin chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.",
  // Cart & checkout
  PRODUCT_UNAVAILABLE: "Có sản phẩm hiện không thể đặt mua. Vui lòng xóa hoặc điều chỉnh sản phẩm được đánh dấu.",
  INSUFFICIENT_STOCK: "Cửa hàng không đủ nguyên liệu cho toàn bộ giỏ hàng. Vui lòng giảm số lượng hoặc chọn ngày khác.",
  CART_EMPTY: "Giỏ hàng của bạn đang trống.",
  CART_CHANGED: "Giỏ hàng vừa thay đổi. Vui lòng xem lại trước khi đặt hàng.",
  ACCOUNT_SUSPENDED: "Tài khoản của bạn đang bị tạm khóa đặt hàng.",
  INVALID_DELIVERY_DATE: "Ngày giao phải từ hôm nay trở đi.",
  DELIVERY_SLOT_STARTED: "Khung giờ giao này đã bắt đầu. Vui lòng chọn khung giờ khác.",
};
