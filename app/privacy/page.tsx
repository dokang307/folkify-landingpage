import Navbar from "@/components/Navbar";
import FooterColumn from "@/components/ui/footer-column";

export const metadata = {
  title: "Chính sách bảo mật — Folkify",
  description: "Chính sách bảo mật của ứng dụng Folkify — Học nhạc cụ dân tộc Việt Nam.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-white mb-2">Chính sách bảo mật</h1>
        <p className="text-white/50 mb-10">Cập nhật lần cuối: tháng 7 năm 2026</p>

        <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/80">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Giới thiệu</h2>
            <p>
              Folkify ("chúng tôi", "ứng dụng") coi trọng quyền riêng tư của bạn. Chính sách này
              giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân khi bạn sử
              dụng ứng dụng Folkify trên iOS và Android.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Thông tin chúng tôi thu thập</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Thông tin tài khoản:</strong> tên, địa chỉ email khi bạn đăng ký tài
                khoản hoặc đăng nhập qua Google / Apple.
              </li>
              <li>
                <strong>Dữ liệu tiến trình học:</strong> các bài học đã hoàn thành, điểm số,
                huy hiệu và thống kê học tập.
              </li>
              <li>
                <strong>Thông tin thanh toán:</strong> giao dịch đăng ký gói được xử lý qua cổng
                thanh toán PayOS bằng chuyển khoản ngân hàng hoặc quét mã QR. Chúng tôi không
                lưu trữ thông tin tài khoản ngân hàng của bạn.
              </li>
              <li>
                <strong>Dữ liệu kỹ thuật:</strong> loại thiết bị, phiên bản hệ điều hành, nhật
                ký sự cố (crash logs) nhằm cải thiện độ ổn định của ứng dụng.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cách chúng tôi sử dụng thông tin</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cung cấp và cá nhân hóa trải nghiệm học tập.</li>
              <li>Xác thực danh tính và bảo mật tài khoản.</li>
              <li>Xử lý đăng ký và quản lý quyền truy cập tính năng Premium.</li>
              <li>Gửi thông báo liên quan đến dịch vụ (nếu bạn cho phép).</li>
              <li>Phân tích và cải thiện tính năng của ứng dụng.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Chia sẻ thông tin</h2>
            <p>
              Chúng tôi <strong>không</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của
              bạn với bên thứ ba vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các
              trường hợp:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Nhà cung cấp dịch vụ kỹ thuật (hosting, phân tích lỗi) theo hợp đồng bảo mật.</li>
              <li>Yêu cầu pháp lý hoặc lệnh của cơ quan có thẩm quyền.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Gói đăng ký trả phí</h2>
            <p>
              Folkify cung cấp gói đăng ký trả phí theo tháng (Basic và Pro). Gói có hiệu lực
              30 ngày kể từ ngày thanh toán thành công. Sau khi hết hạn, tài khoản sẽ tự động
              chuyển về gói Free nếu không gia hạn. Bạn có thể gia hạn bất kỳ lúc nào trong
              ứng dụng hoặc trên trang web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Lưu trữ và bảo mật dữ liệu</h2>
            <p>
              Dữ liệu của bạn được lưu trữ trên máy chủ bảo mật. Chúng tôi áp dụng mã hóa
              HTTPS và các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ thông tin của bạn. Tuy
              nhiên, không có hệ thống nào đảm bảo an toàn tuyệt đối.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Quyền của bạn</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Truy cập và chỉnh sửa thông tin tài khoản trong ứng dụng.</li>
              <li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.</li>
              <li>Rút lại sự đồng ý thu thập dữ liệu bất kỳ lúc nào.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Trẻ em</h2>
            <p>
              Folkify không cố ý thu thập thông tin cá nhân của trẻ em dưới 13 tuổi. Nếu bạn là
              phụ huynh và phát hiện con mình đã cung cấp thông tin, vui lòng liên hệ chúng tôi
              để xóa dữ liệu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Liên hệ</h2>
            <p>
              Mọi câu hỏi về chính sách bảo mật, vui lòng liên hệ:{" "}
              <a
                href="mailto:support@folkify.vn"
                className="text-[#52b788] underline hover:text-[#74c99e]"
              >
                support@folkify.vn
              </a>
            </p>
          </section>

        </div>
      </div>
      <FooterColumn />
    </main>
  );
}
