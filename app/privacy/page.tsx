"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterColumn from "@/components/ui/footer-column";

type Lang = "vi" | "en";

const content = {
  vi: {
    title: "Chính sách bảo mật",
    updated: "Cập nhật lần cuối: tháng 11 năm 2026",
    sections: [
      {
        heading: "1. Giới thiệu",
        body: (
          <p>
            Folkify (&quot;chúng tôi&quot;, &quot;ứng dụng&quot;) coi trọng quyền riêng tư của bạn. Chính sách này
            giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân khi bạn sử
            dụng ứng dụng Folkify trên iOS, Android và web.
          </p>
        ),
      },
      {
        heading: "2. Thông tin chúng tôi thu thập",
        body: (
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Thông tin tài khoản:</strong> tên, địa chỉ email khi bạn đăng ký tài khoản.</li>
            <li><strong>Dữ liệu tiến trình học:</strong> các bài học đã hoàn thành, điểm số, huy hiệu và thống kê học tập.</li>
            <li><strong>Thông tin thanh toán:</strong> giao dịch đăng ký gói được xử lý qua cổng thanh toán PayOS bằng chuyển khoản ngân hàng hoặc quét mã QR. Chúng tôi không lưu trữ thông tin tài khoản ngân hàng của bạn.</li>
            <li><strong>Dữ liệu kỹ thuật:</strong> loại thiết bị, phiên bản hệ điều hành, nhật ký sự cố (crash logs) nhằm cải thiện độ ổn định của ứng dụng.</li>
          </ul>
        ),
      },
      {
        heading: "3. Cách chúng tôi sử dụng thông tin",
        body: (
          <ul className="list-disc pl-6 space-y-2">
            <li>Cung cấp và cá nhân hóa trải nghiệm học tập.</li>
            <li>Xác thực danh tính và bảo mật tài khoản.</li>
            <li>Xử lý đăng ký và quản lý quyền truy cập tính năng Premium.</li>
            <li>Gửi thông báo liên quan đến dịch vụ (nếu bạn cho phép).</li>
            <li>Phân tích và cải thiện tính năng của ứng dụng.</li>
          </ul>
        ),
      },
      {
        heading: "4. Chia sẻ thông tin",
        body: (
          <>
            <p>
              Chúng tôi <strong>không</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của
              bạn với bên thứ ba vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Nhà cung cấp dịch vụ kỹ thuật (hosting, phân tích lỗi) theo hợp đồng bảo mật.</li>
              <li>Yêu cầu pháp lý hoặc lệnh của cơ quan có thẩm quyền.</li>
            </ul>
          </>
        ),
      },
      {
        heading: "5. Gói đăng ký trả phí",
        body: (
          <p>
            Folkify cung cấp gói đăng ký trả phí theo tháng (Basic và Pro). Gói có hiệu lực
            30 ngày kể từ ngày thanh toán thành công. Sau khi hết hạn, tài khoản sẽ tự động
            chuyển về gói Free nếu không gia hạn. Bạn có thể gia hạn bất kỳ lúc nào trong
            ứng dụng hoặc trên trang web.
          </p>
        ),
      },
      {
        heading: "6. Lưu trữ và bảo mật dữ liệu",
        body: (
          <p>
            Dữ liệu của bạn được lưu trữ trên máy chủ bảo mật. Chúng tôi áp dụng mã hóa
            HTTPS và các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ thông tin của bạn. Tuy
            nhiên, không có hệ thống nào đảm bảo an toàn tuyệt đối.
          </p>
        ),
      },
      {
        heading: "7. Quyền của bạn",
        body: (
          <ul className="list-disc pl-6 space-y-2">
            <li>Truy cập và chỉnh sửa thông tin tài khoản trong ứng dụng.</li>
            <li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.</li>
            <li>Rút lại sự đồng ý thu thập dữ liệu bất kỳ lúc nào.</li>
          </ul>
        ),
      },
      {
        heading: "8. Trẻ em",
        body: (
          <p>
            Folkify không cố ý thu thập thông tin cá nhân của trẻ em dưới 13 tuổi. Nếu bạn là
            phụ huynh và phát hiện con mình đã cung cấp thông tin, vui lòng liên hệ chúng tôi
            để xóa dữ liệu.
          </p>
        ),
      },
      {
        heading: "9. Liên hệ",
        body: (
          <p>
            Mọi câu hỏi về chính sách bảo mật, vui lòng liên hệ:{" "}
            <a href="mailto:support@folkify.vn" className="text-[#52b788] underline hover:text-[#74c99e]">support@folkify.vn</a>
          </p>
        ),
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: November 2026",
    sections: [
      {
        heading: "1. Introduction",
        body: (
          <p>
            Folkify (&quot;we&quot;, &quot;the app&quot;) values your privacy. This policy explains how we collect,
            use, and protect your personal information when you use the Folkify application on
            iOS, Android, and the web.
          </p>
        ),
      },
      {
        heading: "2. Information We Collect",
        body: (
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account information:</strong> name and email address when you register an account.</li>
            <li><strong>Learning progress data:</strong> completed lessons, scores, badges, and learning statistics.</li>
            <li><strong>Payment information:</strong> subscription transactions are processed through the PayOS payment gateway via bank transfer or QR code. We do not store your bank account information.</li>
            <li><strong>Technical data:</strong> device type, operating system version, and crash logs to improve application stability.</li>
          </ul>
        ),
      },
      {
        heading: "3. How We Use Your Information",
        body: (
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and personalize the learning experience.</li>
            <li>Authenticate identity and secure your account.</li>
            <li>Process subscriptions and manage Premium feature access.</li>
            <li>Send service-related notifications (with your permission).</li>
            <li>Analyze and improve application features.</li>
          </ul>
        ),
      },
      {
        heading: "4. Information Sharing",
        body: (
          <>
            <p>
              We do <strong>not</strong> sell, rent, or share your personal information with third
              parties for commercial purposes. Information is only shared in the following cases:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Technical service providers (hosting, error analytics) under confidentiality agreements.</li>
              <li>Legal requirements or orders from competent authorities.</li>
            </ul>
          </>
        ),
      },
      {
        heading: "5. Paid Subscription Plans",
        body: (
          <p>
            Folkify offers monthly paid subscription plans (Basic and Pro). Each plan is valid for
            30 days from the date of successful payment. After expiration, your account will
            automatically revert to the Free plan if not renewed. You can renew at any time
            through the app or on the website.
          </p>
        ),
      },
      {
        heading: "6. Data Storage and Security",
        body: (
          <p>
            Your data is stored on secure servers. We use HTTPS encryption and industry-standard
            security measures to protect your information. However, no system can guarantee
            absolute security.
          </p>
        ),
      },
      {
        heading: "7. Your Rights",
        body: (
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and edit your account information within the app.</li>
            <li>Request deletion of your account and all associated data.</li>
            <li>Withdraw your consent to data collection at any time.</li>
          </ul>
        ),
      },
      {
        heading: "8. Children",
        body: (
          <p>
            Folkify does not intentionally collect personal information from children under 13
            years of age. If you are a parent and discover that your child has provided
            information, please contact us to have the data deleted.
          </p>
        ),
      },
      {
        heading: "9. Contact",
        body: (
          <p>
            For any questions about this privacy policy, please contact:{" "}
            <a href="mailto:support@folkify.vn" className="text-[#52b788] underline hover:text-[#74c99e]">support@folkify.vn</a>
          </p>
        ),
      },
    ],
  },
};

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("vi");
  const t = content[lang];

  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
          <button
            onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            <span className="text-base leading-none">{lang === "vi" ? "🇬🇧" : "🇻🇳"}</span>
            {lang === "vi" ? "English" : "Tiếng Việt"}
          </button>
        </div>
        <p className="text-white/50 mb-10">{t.updated}</p>

        <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/80">
          {t.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold text-white mb-3">{s.heading}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
      <FooterColumn />
    </main>
  );
}
