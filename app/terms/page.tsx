import Navbar from "@/components/Navbar";
import FooterColumn from "@/components/ui/footer-column";

export const metadata = {
  title: "Điều khoản sử dụng — Folkify",
  description: "Điều khoản sử dụng của ứng dụng Folkify — Học nhạc cụ dân tộc Việt Nam.",
};

export default function TermsPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-white mb-2">Điều khoản sử dụng</h1>
        <p className="text-white/50 mb-10">Cập nhật lần cuối: tháng 11 năm 2026</p>

        <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/80">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Chấp nhận điều khoản</h2>
            <p>
              Bằng việc truy cập hoặc sử dụng ứng dụng Folkify (&quot;Dịch vụ&quot;), bạn đồng ý
              tuân thủ các điều khoản này. Nếu bạn không đồng ý, vui lòng ngừng sử dụng Dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Mô tả dịch vụ</h2>
            <p>
              Folkify là nền tảng học nhạc cụ dân tộc Việt Nam, cung cấp bài học, bài tập thực
              hành, bài kiểm tra và tính năng chấm điểm biểu diễn bằng AI. Dịch vụ có phiên bản
              miễn phí (Free) và trả phí (Basic, Pro) với các quyền truy cập khác nhau.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Tài khoản người dùng</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bạn phải cung cấp thông tin chính xác khi đăng ký tài khoản.</li>
              <li>Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động dưới tài khoản của mình.</li>
              <li>Bạn phải từ 13 tuổi trở lên để sử dụng Dịch vụ.</li>
              <li>Chúng tôi có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Thanh toán và đăng ký gói</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Các gói trả phí (Basic, Pro) được thanh toán theo tháng thông qua cổng thanh toán
                PayOS bằng chuyển khoản ngân hàng hoặc quét mã QR.
              </li>
              <li>
                Gói có hiệu lực 30 ngày kể từ ngày thanh toán thành công. Sau khi hết hạn, tài
                khoản sẽ tự động chuyển về gói Free nếu không gia hạn.
              </li>
              <li>
                Folkify không lưu trữ thông tin tài khoản ngân hàng của bạn. Mọi giao dịch được
                xử lý hoàn toàn qua PayOS.
              </li>
              <li>
                Chúng tôi không hoàn tiền cho các giao dịch đã thanh toán thành công, trừ trường
                hợp lỗi hệ thống được xác nhận.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Quyền sở hữu trí tuệ</h2>
            <p>
              Toàn bộ nội dung trên Folkify — bao gồm bài học, hình ảnh, âm thanh, sheet nhạc,
              giao diện và mã nguồn — thuộc quyền sở hữu của Folkify hoặc các đối tác cấp phép.
              Bạn không được sao chép, phân phối hoặc sử dụng nội dung cho mục đích thương mại
              mà không có sự đồng ý bằng văn bản.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Hành vi bị cấm</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sử dụng Dịch vụ cho mục đích bất hợp pháp.</li>
              <li>Cố tình phá hoại, tấn công hoặc can thiệp vào hệ thống.</li>
              <li>Chia sẻ tài khoản trả phí hoặc lạm dụng tính năng dùng thử.</li>
              <li>Thu thập thông tin người dùng khác mà không được phép.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Giới hạn trách nhiệm</h2>
            <p>
              Folkify cung cấp Dịch vụ trên cơ sở &quot;nguyên trạng&quot; (as-is). Chúng tôi nỗ
              lực đảm bảo tính chính xác của nội dung nhưng không cam kết Dịch vụ luôn hoạt động
              liên tục, không có lỗi. Folkify không chịu trách nhiệm cho bất kỳ thiệt hại gián
              tiếp nào phát sinh từ việc sử dụng Dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Thay đổi điều khoản</h2>
            <p>
              Chúng tôi có thể cập nhật các điều khoản này. Thay đổi quan trọng sẽ được thông báo
              qua email hoặc thông báo trong ứng dụng. Việc tiếp tục sử dụng Dịch vụ sau khi thay
              đổi có nghĩa là bạn chấp nhận các điều khoản mới.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Liên hệ</h2>
            <p>
              Mọi câu hỏi về điều khoản sử dụng, vui lòng liên hệ:{" "}
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
