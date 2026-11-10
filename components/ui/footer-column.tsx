import {
  Share2,
  Music2,
  Play,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import AppStoreLink from "@/components/ui/app-store-link";
import { APP_STORE_URL } from "@/lib/app-links";

const data = {
  facebookLink: "https://facebook.com/folkify",
  instaLink: "https://instagram.com/folkify",
  youtubeLink: "https://youtube.com/@folkify",
  services: {
    features: "#features",
    instruments: "#instruments",
    pricing: "#pricing",
    faq: "#faq",
  },
  about: {
    story: "#",
    team: "#",
    blog: "#",
    press: "#",
  },
  help: {
    support: "mailto:support@folkify.vn",
    privacy: "/privacy",
    terms: "/terms",
    appstore: APP_STORE_URL,
  },
  contact: {
    email: "support@folkify.vn",
    phone: "+84 90 123 4567",
    address: "TP. Hồ Chí Minh, Việt Nam",
  },
  company: {
    name: "Folkify",
    description:
      "Ứng dụng học nhạc cụ dân tộc Việt Nam — giúp bạn khám phá và thành thạo đàn tranh, sáo trúc, đàn bầu và nhiều hơn nữa.",
    logo: "/logo.png",
  },
};

const socialLinks = [
  { icon: Share2, label: "Facebook", href: data.facebookLink },
  { icon: Music2, label: "Instagram", href: data.instaLink },
  { icon: Play, label: "YouTube", href: data.youtubeLink },
];

const aboutLinks = [
  { text: "Câu chuyện Folkify", href: data.about.story },
  { text: "Đội ngũ", href: data.about.team },
  { text: "Blog âm nhạc", href: data.about.blog },
  { text: "Báo chí", href: data.about.press },
];

const serviceLinks = [
  { text: "Tính năng", href: data.services.features },
  { text: "Nhạc cụ", href: data.services.instruments },
  { text: "Bảng giá", href: data.services.pricing },
  { text: "FAQ", href: data.services.faq },
];

const helpfulLinks = [
  { text: "Hỗ trợ", href: data.help.support },
  { text: "Chính sách bảo mật", href: data.help.privacy },
  { text: "Điều khoản sử dụng", href: data.help.terms },
  { text: "App Store", href: data.help.appstore, hasIndicator: true, trackAppStore: true },
];

const contactInfo = [
  { icon: Mail, text: data.contact.email },
  { icon: Phone, text: data.contact.phone },
  { icon: MapPin, text: data.contact.address, isAddress: true },
];

export default function FooterColumn() {
  return (
    <footer className="bg-[#060f09] border-t border-white/5 w-full">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-6 lg:pt-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-md bg-white flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.company.logo}
                  alt="Folkify logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">
                {data.company.name}
              </span>
            </div>

            <p className="text-[#95d5b2]/60 mt-5 max-w-xs text-sm leading-relaxed">
              {data.company.description}
            </p>

            <ul className="mt-7 flex gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="w-9 h-9 rounded-full bg-[#1a4a2e] flex items-center justify-center text-[#52b788] hover:bg-[#52b788] hover:text-[#0a1f14] transition-colors"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-2">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-5 font-medium">
                Về chúng tôi
              </p>
              <ul className="space-y-3 text-sm">
                {aboutLinks.map(({ text, href }) => (
                  <li key={text}>
                    <a
                      href={href}
                      className="text-[#95d5b2]/60 hover:text-[#95d5b2] transition-colors"
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-5 font-medium">
                Sản phẩm
              </p>
              <ul className="space-y-3 text-sm">
                {serviceLinks.map(({ text, href }) => (
                  <li key={text}>
                    <a
                      href={href}
                      className="text-[#95d5b2]/60 hover:text-[#95d5b2] transition-colors"
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-5 font-medium">
                Hỗ trợ
              </p>
              <ul className="space-y-3 text-sm">
                {helpfulLinks.map(({ text, href, hasIndicator, trackAppStore }) => {
                  const linkClass = hasIndicator
                    ? "flex items-center gap-1.5"
                    : "text-[#95d5b2]/60 hover:text-[#95d5b2] transition-colors";
                  const linkContent = (
                    <>
                      <span className="text-[#95d5b2]/60 hover:text-[#95d5b2] transition-colors">
                        {text}
                      </span>
                      {hasIndicator && (
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#52b788] opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-[#52b788]" />
                        </span>
                      )}
                    </>
                  );

                  return (
                    <li key={text}>
                      {trackAppStore ? (
                        <AppStoreLink href={href} className={linkClass}>
                          {linkContent}
                        </AppStoreLink>
                      ) : (
                        <a href={href} className={linkClass}>
                          {linkContent}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-5 font-medium">
                Liên hệ
              </p>
              <ul className="space-y-3 text-sm">
                {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                  <li key={text}>
                    <a
                      href="#"
                      className="flex items-start gap-2 text-[#95d5b2]/60 hover:text-[#95d5b2] transition-colors"
                    >
                      <Icon className="w-4 h-4 text-[#52b788] shrink-0 mt-0.5" />
                      {isAddress ? (
                        <address className="not-italic leading-snug">{text}</address>
                      ) : (
                        <span>{text}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#95d5b2]/30 text-xs">
            © 2026 {data.company.name}. All rights reserved.
          </p>
          <p className="text-[#95d5b2]/30 text-xs">
            Made with 🎵 in Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
