import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export const Footer = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Footer - Flex with justify-between */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-6 mb-6">
          {/* House Detail Section */}
          <div className="space-y-3 w-[100%] sm:w-[30%]">
            <a href="/" className="flex items-center gap-3 group">
              <img
                src="/images/ph-logo.png"
                alt="Logo"
                className="h-10 w-10 rounded-full shadow-md group-hover:shadow-lg group-hover:shadow-cyan-600/50 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/40";
                }}
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  {settings.publisher_name || "Publishing House"}
                </h1>
                <p className="text-xs text-gray-400">
                  {settings.tagline ||
                    "Books, journals and stories that matter"}
                </p>
              </div>
            </a>

            <p className="text-sm text-gray-400 leading-relaxed max-w-[280px]">
              {settings.about ||
                "We publish quality academic journals, literary works, and cultural publications that inspire and educate readers worldwide."}
            </p>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-3 w-[100%] sm:w-[30%]">
            <h3 className="text-white font-semibold mb-2 text-sm">
              Contact Info
            </h3>
            <ul className="space-y-2 text-sm">
              {/* Email */}
              {settings.contact_email && settings.contact_email !== "" && (
                <li>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-white transition flex items-center gap-2 group"
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 group-hover:text-white transition" />
                    <span className="break-all text-xs">
                      {settings.contact_email}
                    </span>
                  </a>
                </li>
              )}

              {/* Phone/WhatsApp Number */}
              {settings.whatsapp_number && settings.whatsapp_number !== "" && (
                <li>
                  <a
                    href={`tel:${settings.whatsapp_number}`}
                    className="hover:text-white transition flex items-center gap-2 group"
                  >
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 group-hover:text-white transition" />
                    <span className="text-xs">
                      +91 {settings.whatsapp_number}
                    </span>
                  </a>
                </li>
              )}

              {/* Address */}
              {settings.contact_address && settings.contact_address !== "" && (
                <li className="flex gap-2">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 mt-0.5" />
                  <span className="text-xs text-gray-400 leading-relaxed">
                    {settings.contact_address}
                  </span>
                </li>
              )}

              {/* Default contact info */}
              {(!settings.whatsapp_number || settings.whatsapp_number === "") &&
                (!settings.contact_email || settings.contact_email === "") &&
                (!settings.contact_address ||
                  settings.contact_address === "") && (
                  <>
                    <li className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs">
                        contact@publishinghouse.com
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs">+91 9310004022</span>
                    </li>
                    <li className="flex gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        Office No. 902, 9th Floor, Pegasus Tower, A-10, Block A,
                        Sector 68, Noida, Uttar Pradesh 201309
                      </span>
                    </li>
                  </>
                )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 w-[50%] sm:w-[20%]">
            <h3 className="text-white font-semibold mb-2 text-sm">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/payment-methods"
                  className="text-xs hover:text-white transition inline-block"
                >
                  Payment Methods
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-xs hover:text-white transition inline-block"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/catalogue"
                  className="text-xs hover:text-white transition inline-block"
                >
                  Catalogue
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-xs hover:text-white transition inline-block"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links*/}
          <div className="space-y-3 ">
            <h3 className="text-white font-semibold mb-2 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/terms"
                  className="text-xs hover:text-white transition inline-block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-xs hover:text-white transition inline-block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="text-xs hover:text-white transition inline-block"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="/returns"
                  className="text-xs hover:text-white transition inline-block"
                >
                  Return Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-4 mt-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
            <div className="text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              {settings.publisher_name || "Publishing House"}. All rights
              reserved.
            </div>
            <div className="flex space-x-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gradient-to-b from-gray-800 via-blue-700 to-gray-900 transition-colors hover:text-white"
              >
                <Facebook className="h-4 w-4 transition" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gradient-to-r from-gray-700 via-rose-500 to-orange-400 transition-colors hover:text-white"
              >
                <Instagram className="h-4 w-4 transition" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 transition-colors hover:text-white"
              >
                <Twitter className="h-4 w-4 transition" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gradient-to-b from-blue-200 via-blue-400 to-blue-600 transition-colors hover:text-black"
              >
                <Linkedin className="h-4 w-4 transition" />
              </a>
            </div>
            <div className="text-center md:text-right">
              Designed & Built with <span className="text-red-500">❤️</span> By
              Dushyant Pal
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
