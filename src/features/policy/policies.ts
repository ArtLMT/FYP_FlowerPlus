/**
 * The shop's policy texts, shown at /policies/<slug>.
 *
 * Each sentence states what the shop does today. A rule that is decided but not built yet
 * (penalty points, online payment and refunds, failed delivery, the wish card) is left out on
 * purpose: add it here when the feature is built, not before.
 */

import { DELIVERY_AREA, SHOP_EMAIL } from "@/lib/shop";

export type PolicySlug = "terms" | "privacy" | "orders" | "delivery";

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface Policy {
  slug: PolicySlug;
  title: string;
  intro: string;
  sections: PolicySection[];
}

/** Shown under every title. Change it whenever a text below changes. */
export const POLICY_UPDATED = "13/11/2026";

export const POLICY_ORDER: PolicySlug[] = ["terms", "privacy", "orders", "delivery"];

export const POLICIES: Record<PolicySlug, Policy> = {
  terms: {
    slug: "terms",
    title: "Điều khoản sử dụng",
    intro:
      "Các điều khoản này áp dụng khi bạn xem sản phẩm, đặt hoa hoặc thiết kế bó hoa riêng trên website FlowerPlus. Khi tạo tài khoản, bạn đồng ý với các điều khoản này và với Chính sách bảo mật.",
    sections: [
      {
        heading: "Tài khoản",
        items: [
          "Bạn có thể xem sản phẩm và thêm vào giỏ hàng mà không cần tài khoản. Để đặt hàng, gửi yêu cầu thiết kế riêng và xem lịch sử đơn hàng, bạn cần đăng nhập.",
          "Tài khoản đăng ký bằng email phải được xác thực bằng mã gửi về hộp thư trước khi đăng nhập.",
          "Bạn có thể đăng nhập bằng Google khi Google xác nhận email của bạn đã được xác thực.",
          "Nếu quên mật khẩu, bạn đặt lại bằng mã gửi về email của tài khoản.",
        ],
      },
      {
        heading: "Giá và giảm giá",
        items: [
          "Giá được hiển thị bằng đồng Việt Nam. Giảm giá của sản phẩm được áp dụng tự động, không cần nhập mã.",
          "Tổng tiền được tính lại khi bạn đặt hàng. Nếu giá đã thay đổi so với lúc bạn xem, đơn chưa được tạo: bạn sẽ thấy tổng tiền mới và tự quyết định có đặt hay không.",
          "Đơn đã đặt giữ nguyên giá tại thời điểm đặt, kể cả khi sau đó sản phẩm đổi giá.",
        ],
      },
      {
        heading: "Mã giảm giá",
        items: [
          "Chỉ tài khoản khách hàng đã xác thực mới xem và dùng được mã giảm giá.",
          "Mỗi đơn hàng dùng được một mã.",
          "Mỗi mã có thời hạn và số lượt dùng chung cho mọi khách. Mã hết hạn vào cuối ngày ghi trên mã, theo giờ Việt Nam. Khi hết hạn hoặc hết lượt, mã không dùng được nữa.",
          "Một số mã yêu cầu giá trị đơn tối thiểu, và một số mã chỉ dành cho khách được cửa hàng gửi tặng.",
          "Mã giảm trên tiền hàng sau khi đã trừ giảm giá của sản phẩm, và không giảm phí giao hàng.",
          "Mã giảm giá không áp dụng cho đơn thiết kế riêng.",
          "Khi đơn bị hủy trước lúc cửa hàng chuẩn bị, lượt dùng mã được trả lại. Mã đã hết hạn thì vẫn không dùng lại được.",
        ],
      },
      {
        heading: "Đơn thiết kế riêng",
        items: [
          "Bạn chọn kiểu cắm, hoa và phụ kiện. Website hiển thị giá tạm tính, gồm giá nguyên liệu và phí công của kiểu cắm đã chọn.",
          "Giá tạm tính là giá cuối cùng, trừ khi cửa hàng gửi đề xuất thay đổi.",
          "Cửa hàng có thể đề xuất thay đổi nguyên liệu hoặc giá. Bạn nhận email báo tin, rồi chấp nhận hoặc từ chối đề xuất trên trang đơn hàng.",
          "Yêu cầu chỉ được thực hiện sau khi cửa hàng duyệt. Cửa hàng có thể hủy yêu cầu và ghi rõ lý do.",
          "Đơn thiết kế riêng được thanh toán khi nhận hàng.",
        ],
      },
      {
        heading: "Hủy đơn và giao hàng",
        paragraphs: [
          "Quy định về hủy đơn nằm trong Chính sách đặt hàng, hủy đơn và hoàn tiền. Quy định về ngày giờ và địa chỉ giao nằm trong Chính sách giao hàng.",
        ],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    title: "Chính sách bảo mật",
    intro:
      "Trang này cho biết FlowerPlus lưu những thông tin nào của bạn, dùng vào việc gì và giữ trong bao lâu.",
    sections: [
      {
        heading: "Thông tin chúng tôi lưu",
        items: [
          "Tài khoản: họ tên, email và mật khẩu. Mật khẩu được lưu ở dạng đã băm một chiều, nên cửa hàng không đọc được mật khẩu của bạn.",
          "Nếu bạn đăng nhập bằng Google: tên, email, đường dẫn ảnh đại diện và mã định danh tài khoản Google của bạn. Chúng tôi không nhận mật khẩu Google.",
          "Sổ địa chỉ: tên người nhận, số điện thoại và địa chỉ, tối đa 20 địa chỉ.",
          "Đơn hàng: sản phẩm, số lượng, giá, ghi chú, ngày giờ giao mong muốn, thông tin người nhận và lịch sử trạng thái của đơn.",
          "Giỏ hàng: sản phẩm và số lượng bạn đã chọn.",
        ],
      },
      {
        heading: "Chúng tôi dùng thông tin để làm gì",
        items: [
          "Xác nhận, chuẩn bị và giao đơn hàng của bạn.",
          "Đăng nhập và bảo vệ tài khoản của bạn.",
          "Gửi email cần thiết cho tài khoản và đơn hàng.",
        ],
      },
      {
        heading: "Email chúng tôi gửi",
        items: [
          "Mã xác thực khi bạn đăng ký hoặc đặt lại mật khẩu.",
          "Thông báo khi cửa hàng gửi đề xuất cho đơn thiết kế riêng của bạn.",
          "Hiện chúng tôi không gửi email quảng cáo.",
        ],
      },
      {
        heading: "Cookie",
        items: [
          "Cookie đăng nhập giữ phiên đăng nhập của bạn. Mã chạy trên trang web không đọc được các cookie này.",
          "Cookie giỏ hàng giữ giỏ hàng khi bạn chưa đăng nhập. Giỏ này được lưu 30 ngày kể từ lần thay đổi gần nhất, và được gộp vào tài khoản khi bạn đăng nhập.",
          "Website không dùng cookie quảng cáo hay công cụ theo dõi hành vi.",
        ],
      },
      {
        heading: "Bên thứ ba",
        items: [
          "Google: khi bạn chọn đăng nhập bằng Google. Website cũng tải bộ biểu tượng từ Google Fonts, nên trình duyệt của bạn có kết nối tới máy chủ của Google.",
          "Người giao hàng: tên, số điện thoại và địa chỉ người nhận được dùng để giao đơn.",
          "Chúng tôi không bán thông tin của bạn.",
        ],
      },
      {
        heading: "Thời gian lưu giữ",
        items: [
          "Đơn hàng được giữ lại làm lịch sử và không bị xóa.",
          "Bạn có thể sửa hoặc xóa địa chỉ trong sổ địa chỉ. Đơn đã đặt vẫn giữ bản sao địa chỉ tại thời điểm đặt.",
          "Website chưa có chức năng xóa tài khoản. Hiện bạn có thể tự xóa các địa chỉ đã lưu trong sổ địa chỉ.",
        ],
      },
    ],
  },

  orders: {
    slug: "orders",
    title: "Chính sách đặt hàng, hủy đơn và hoàn tiền",
    intro:
      "Trang này cho biết một đơn hàng đi qua những bước nào, khi nào bạn còn hủy được và việc thanh toán diễn ra thế nào.",
    sections: [
      {
        heading: "Đặt hàng",
        items: [
          "Bạn cần đăng nhập để đặt hàng.",
          "Hoa được làm sau khi bạn đặt. Đơn mới ở trạng thái \"Chờ xác nhận\" cho đến khi cửa hàng xác nhận và bắt đầu chuẩn bị.",
          "Đơn hàng đi qua các trạng thái: Chờ xác nhận, Đang chuẩn bị, Đang giao, Hoàn tất.",
        ],
      },
      {
        heading: "Thanh toán",
        items: [
          "Hiện cửa hàng chỉ nhận thanh toán khi nhận hàng. Website chưa hỗ trợ thanh toán trực tuyến.",
          "Bạn hoặc người nhận trả đủ tiền cho người giao hàng trước khi nhận hoa.",
        ],
      },
      {
        heading: "Hủy đơn",
        items: [
          "Đơn thường: bạn tự hủy được khi đơn còn ở trạng thái \"Chờ xác nhận\".",
          "Đơn thiết kế riêng: bạn tự hủy được khi yêu cầu đang chờ duyệt, khi đang có đề xuất chờ bạn trả lời, hoặc khi đơn đã được xác nhận nhưng cửa hàng chưa bắt đầu chuẩn bị.",
          "Khi cửa hàng đã bắt đầu chuẩn bị, đơn không hủy được nữa.",
          "Khi hủy, bạn cần ghi lý do.",
          "Cửa hàng cũng có thể hủy đơn trước khi chuẩn bị. Lý do được ghi trên trang đơn hàng của bạn.",
          "Đơn đã hủy không khôi phục được. Nếu vẫn muốn mua, bạn đặt một đơn mới.",
        ],
      },
      {
        heading: "Hoàn tiền",
        paragraphs: [
          "Vì hiện cửa hàng chỉ nhận thanh toán khi nhận hàng, đơn bị hủy không phát sinh khoản tiền nào cần hoàn.",
        ],
      },
      {
        heading: "Khi hoa nhận được không đúng với đơn hoặc bị hư hỏng",
        paragraphs: [
          `Vui lòng gửi email tới ${SHOP_EMAIL} trong vòng 24 giờ kể từ khi nhận hàng, kèm ảnh chụp. Cửa hàng sẽ đổi hoa hoặc thỏa thuận cách xử lý khác với bạn.`,
        ],
      },
    ],
  },

  delivery: {
    slug: "delivery",
    title: "Chính sách giao hàng",
    intro: "Trang này cho biết khu vực giao hàng, cách chọn ngày giờ giao, địa chỉ nhận và phí giao hàng.",
    sections: [
      {
        heading: "Khu vực giao hàng",
        items: [
          `Cửa hàng giao hàng trong ${DELIVERY_AREA}.`,
          "Website không tự kiểm tra khu vực của địa chỉ. Nếu địa chỉ nằm ngoài khu vực giao, cửa hàng sẽ hủy đơn và ghi rõ lý do trên trang đơn hàng của bạn.",
        ],
      },
      {
        heading: "Ngày và khung giờ giao",
        items: [
          "Khi đặt hàng, bạn có thể chọn ngày và một trong bốn khung giờ: 9:00 – 12:00, 12:00 – 15:00, 15:00 – 18:00, 18:00 – 21:00, theo giờ Việt Nam.",
          "Ngày và khung giờ là mong muốn của bạn, không phải cam kết của cửa hàng. Cửa hàng sắp xếp các đơn theo mong muốn này.",
          "Bạn có thể để trống ngày giờ.",
        ],
      },
      {
        heading: "Địa chỉ nhận hàng",
        items: [
          "Bạn chọn một địa chỉ trong sổ địa chỉ, gồm tên và số điện thoại của người nhận.",
          "Địa chỉ được lưu theo đơn tại thời điểm đặt. Sửa sổ địa chỉ sau đó không làm thay đổi đơn đã đặt.",
          "Website chưa có chức năng sửa địa chỉ của đơn đã đặt, vì vậy vui lòng kiểm tra kỹ địa chỉ trước khi đặt hàng.",
        ],
      },
      {
        heading: "Phí giao hàng",
        // shipping.md rule 4 (since 18 Nov 2026): the fee is GHN's quote, charged with the order.
        items: [
          "Đơn hàng được giao qua Giao Hàng Nhanh (GHN). Phí giao hàng là phí GHN báo cho kiện hàng của bạn đến địa chỉ đã chọn.",
          "Phí giao hàng hiện ở bước xác nhận, trong \"Tổng cộng\", trước khi bạn đặt hàng, và được thu cùng tiền hàng khi nhận hoa.",
          "Địa chỉ chưa chọn phường/xã theo danh sách của GHN được giao miễn phí. Đơn thiết kế riêng hiện chưa tính phí giao hàng.",
        ],
      },
      {
        heading: "Thanh toán khi nhận hàng",
        paragraphs: ["Người nhận trả đủ tiền cho người giao hàng trước khi nhận hoa."],
      },
    ],
  },
};
