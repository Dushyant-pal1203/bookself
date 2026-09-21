import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { useSettings } from "@/hooks/useSettings";
import {
  FileText,
  CreditCard,
  Truck,
  RotateCcw,
  AlertCircle,
  Shield,
  HeartHandshake,
  Siren,
  Mail,
  Scale,
  BookOpen,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

export const TermsOfService = () => {
  const { settings, loading } = useSettings();
  const currentYear = new Date().getFullYear();
  const publisherName = settings?.publisher_name || "Publishing House";
  const contactEmail = settings?.contact_email || "contact@example.com";

  // Navigation items for table of contents
  const navItems = [
    { id: "acceptance", label: "1. Acceptance of Terms", icon: FileText },
    { id: "changes", label: "2. Changes to Terms", icon: HeartHandshake },
    { id: "products", label: "3. Products & Services", icon: BookOpen },
    { id: "orders", label: "4. Orders & Payments", icon: CreditCard },
    { id: "shipping", label: "5. Shipping & Delivery", icon: Truck },
    { id: "returns", label: "6. Returns & Refunds", icon: RotateCcw },
    { id: "account", label: "7. User Accounts", icon: Users },
    { id: "intellectual", label: "8. Intellectual Property", icon: Siren },
    {
      id: "limitations",
      label: "9. Limitations of Liability",
      icon: AlertCircle,
    },
    { id: "governing", label: "10. Governing Law", icon: Scale },
  ];

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-5xl mx-auto">
            Please read these terms carefully before using our services
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Last Updated: {currentYear}
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Table of Contents */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  Table of Contents
                </h2>
              </div>
              <nav className="p-2">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    {item.icon && (
                      <item.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                    )}
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Content - Main Terms Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-8">
              {/* Acceptance */}
              <div id="acceptance" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    1. Acceptance of Terms
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing and using the {publisherName} website, you agree
                  to be bound by these Terms of Service, all applicable laws and
                  regulations, and agree that you are responsible for compliance
                  with any applicable local laws. If you do not agree with any
                  of these terms, you are prohibited from using or accessing
                  this site.
                </p>
              </div>

              {/* Changes */}
              <div id="changes" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <HeartHandshake className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    2. Changes to Terms
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any
                  time. If a revision is material, we will try to provide at
                  least 30 days' notice prior to any new terms taking effect.
                  What constitutes a material change will be determined at our
                  sole discretion. By continuing to access or use our service
                  after those revisions become effective, you agree to be bound
                  by the revised terms.
                </p>
              </div>

              {/* Products */}
              <div id="products" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    3. Products & Services
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {publisherName} offers a variety of publications including
                  academic journals, literary works, and cultural publications.
                  We strive to display accurate information about our products
                  including pricing, availability, and descriptions. However, we
                  do not warrant that product descriptions or other content is
                  accurate, complete, reliable, current, or error-free.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>All products are subject to availability</li>
                  <li>Prices are subject to change without notice</li>
                  <li>
                    We reserve the right to discontinue any product at any time
                  </li>
                  <li>
                    Digital products are for personal use only unless otherwise
                    specified
                  </li>
                </ul>
              </div>

              {/* Orders */}
              <div id="orders" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    4. Orders & Payments
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By placing an order on our website, you warrant that you are
                  legally capable of entering into binding contracts and that
                  all information you provide is accurate and complete.
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Payment Methods
                    </h3>
                    <p className="text-blue-700 text-sm">
                      We accept payments via UPI, Bank Transfer, and other
                      online payment methods. All payments must be made in full
                      before order processing. Payment confirmation may take 2-4
                      hours during business hours.
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      Orders are confirmed only after payment verification
                    </li>
                    <li>
                      We reserve the right to cancel any order at our sole
                      discretion
                    </li>
                    <li>
                      In case of payment failure, please contact our support
                      team
                    </li>
                    <li>All prices are in INR unless otherwise specified</li>
                  </ul>
                </div>
              </div>

              {/* Shipping */}
              <div id="shipping" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    5. Shipping & Delivery
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We ship across India using reliable courier partners. Delivery
                  timelines vary based on your location:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Metro cities: 3-5 business days</li>
                  <li>Tier 2 & 3 cities: 5-7 business days</li>
                  <li>Remote locations: 7-10 business days</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Shipping charges, if applicable, will be calculated at
                  checkout. We are not responsible for delays caused by
                  circumstances beyond our control including natural disasters,
                  strikes, or courier service issues.
                </p>
              </div>

              {/* Returns */}
              <div id="returns" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <RotateCcw className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    6. Returns & Refunds
                  </h2>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Return Policy
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm ml-4">
                    <li>Returns accepted within 7 days of delivery</li>
                    <li>
                      Products must be in original condition with packaging
                    </li>
                    <li>
                      Damaged or defective products qualify for free replacement
                    </li>
                    <li>Digital products are non-refundable once accessed</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To initiate a return, please contact us with your order number
                  and reason for return. Refunds will be processed within 7-10
                  business days after we receive and inspect the returned item.
                </p>
              </div>

              {/* User Accounts */}
              <div id="account" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    7. User Accounts
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you create an account with us, you must provide accurate,
                  complete, and current information. You are solely responsible
                  for maintaining the confidentiality of your account and
                  password.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    You are responsible for all activities under your account
                  </li>
                  <li>Notify us immediately of any unauthorized account use</li>
                  <li>
                    We reserve the right to terminate accounts for violations
                  </li>
                  <li>You must be 18 years or older to create an account</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div id="intellectual" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Siren className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    8. Intellectual Property
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All content on this website including but not limited to text,
                  graphics, logos, images, audio clips, digital downloads, data
                  compilations, and software is the property of {publisherName}{" "}
                  or its content suppliers and is protected by Indian and
                  international copyright laws.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You may not reproduce, distribute, modify, create derivative
                  works of, publicly display, or transmit any content without
                  prior written permission from {publisherName}.
                </p>
              </div>

              {/* Limitations */}
              <div id="limitations" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    9. Limitations of Liability
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the maximum extent permitted by law, {publisherName} shall
                  not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including without
                  limitation, loss of profits, data, use, goodwill, or other
                  intangible losses, resulting from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Your use or inability to use the website</li>
                  <li>
                    Any conduct or content of any third party on the website
                  </li>
                  <li>
                    Unauthorized access, use or alteration of your transmissions
                    or content
                  </li>
                </ul>
              </div>

              {/* Governing Law */}
              <div id="governing" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="h-6 w-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    10. Governing Law
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed and construed in accordance with
                  the laws of India, without regard to its conflict of law
                  provisions. Any disputes arising under or in connection with
                  these Terms shall be subject to the exclusive jurisdiction of
                  the courts in the city where our registered office is located.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Questions?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about these Terms, please contact
                  us:
                </p>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>
            © {currentYear} {publisherName}. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-purple-600 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-purple-600 transition">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-purple-600 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
