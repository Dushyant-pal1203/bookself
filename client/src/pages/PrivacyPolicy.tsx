import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { useSettings } from "@/hooks/useSettings";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Cookie,
  Users,
  History,
  List,
} from "lucide-react";
import { Link } from "react-router-dom";

export const PrivacyPolicy = () => {
  const { settings, loading } = useSettings();
  const currentYear = new Date().getFullYear();
  const publisherName = settings?.publisher_name || "Publishing House";
  const contactEmail = settings?.contact_email || "contact@example.com";
  const contactAddress = settings?.contact_address || "";

  // Navigation items for table of contents
  const navItems = [
    { id: "introduction", label: "Introduction", icon: Shield },
    { id: "information", label: "1. Information We Collect", icon: Database },
    { id: "usage", label: "2. How We Use Your Information", icon: Eye },
    { id: "sharing", label: "3. Information Sharing", icon: Users },
    { id: "security", label: "4. Data Security", icon: Lock },
    { id: "cookies", label: "5. Cookies & Tracking", icon: Cookie },
    { id: "rights", label: "6. Your Rights", icon: FileText },
    { id: "retention", label: "7. Data Retention", icon: History },
    { id: "children", label: "8. Children's Privacy", icon: Users },
    { id: "changes", label: "9. Changes to This Policy", icon: Clock },
    { id: "contact", label: "10. Contact Us", icon: Mail },
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
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-5xl mx-auto">
            Your privacy matters. Learn how we protect and handle your
            information.
          </p>
          <p className="text-sm text-purple-200 mt-4">
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
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-gray-600" />
                  <h2 className="font-semibold text-gray-900">
                    Table of Contents
                  </h2>
                </div>
              </div>
              <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group"
                  >
                    <item.icon className="h-4 w-4 text-gray-400 group-hover:text-purple-500" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Content - Main Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-8">
              {/* Introduction */}
              <div id="introduction" className="mb-8 scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to {publisherName}. We respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal
                  data when you visit our website and tell you about your
                  privacy rights and how the law protects you.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This website is not intended for children and we do not
                  knowingly collect data relating to children. By using our
                  website, you consent to the collection and use of your
                  information as described in this policy.
                </p>
              </div>

              {/* Information We Collect */}
              <div id="information" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    1. Information We Collect
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may collect, use, store and transfer different kinds of
                  personal data about you which we have grouped together as
                  follows:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    <span className="font-semibold">Identity Data:</span>{" "}
                    Includes first name, last name, username or similar
                    identifier.
                  </li>
                  <li>
                    <span className="font-semibold">Contact Data:</span>{" "}
                    Includes billing address, delivery address, email address
                    and telephone numbers.
                  </li>
                  <li>
                    <span className="font-semibold">Transaction Data:</span>{" "}
                    Includes details about payments to and from you and other
                    details of products you have purchased from us.
                  </li>
                  <li>
                    <span className="font-semibold">Technical Data:</span>{" "}
                    Includes internet protocol (IP) address, browser type and
                    version, time zone setting and location.
                  </li>
                  <li>
                    <span className="font-semibold">Profile Data:</span>{" "}
                    Includes your username and password, purchases or orders
                    made by you, your interests, preferences, feedback and
                    survey responses.
                  </li>
                  <li>
                    <span className="font-semibold">Usage Data:</span> Includes
                    information about how you use our website, products and
                    services.
                  </li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div id="usage" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    2. How We Use Your Information
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We will only use your personal data when the law allows us to.
                  Most commonly, we will use your personal data in the following
                  circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>To register you as a new customer</li>
                  <li>
                    To process and deliver your orders including managing
                    payments
                  </li>
                  <li>
                    To manage our relationship with you including notifying you
                    about changes
                  </li>
                  <li>To administer and protect our business and website</li>
                  <li>
                    To deliver relevant website content and advertisements to
                    you
                  </li>
                  <li>
                    To use data analytics to improve our website, products, and
                    customer experience
                  </li>
                  <li>
                    To make suggestions and recommendations to you about goods
                    or services
                  </li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div id="sharing" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    3. Information Sharing
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your personal data with the following parties for
                  the purposes set out above:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    Service providers who provide IT and system administration
                    services
                  </li>
                  <li>
                    Professional advisers including lawyers, bankers, auditors
                    and insurers
                  </li>
                  <li>
                    Government bodies that require us to report processing
                    activities
                  </li>
                  <li>
                    Third parties to whom we may choose to sell, transfer, or
                    merge parts of our business
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We require all third parties to respect the security of your
                  personal data and to treat it in accordance with the law.
                </p>
              </div>

              {/* Data Security */}
              <div id="security" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    4. Data Security
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We have put in place appropriate security measures to prevent
                  your personal data from being accidentally lost, used or
                  accessed in an unauthorized way, altered or disclosed. In
                  addition, we limit access to your personal data to those
                  employees, agents, contractors and other third parties who
                  have a business need to know.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-green-800 text-sm">
                    <span className="font-semibold">
                      ✓ Secure Payment Processing:
                    </span>{" "}
                    All payment transactions are encrypted using SSL technology.
                    We do not store complete payment card details on our
                    servers.
                  </p>
                </div>
              </div>

              {/* Cookies */}
              <div id="cookies" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Cookie className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    5. Cookies & Tracking
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to track
                  activity on our website and hold certain information. Cookies
                  are files with a small amount of data which may include an
                  anonymous unique identifier.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our website.
                </p>
              </div>

              {/* Your Rights */}
              <div id="rights" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    6. Your Rights
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under certain circumstances, you have rights under data
                  protection laws in relation to your personal data:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Request access to your personal data</li>
                  <li>Request correction of your personal data</li>
                  <li>Request erasure of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing your personal data</li>
                  <li>Request transfer of your personal data</li>
                  <li>Right to withdraw consent</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  If you wish to exercise any of these rights, please contact us
                  using the information provided below.
                </p>
              </div>

              {/* Data Retention */}
              <div id="retention" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <History className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    7. Data Retention
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We will only retain your personal data for as long as
                  necessary to fulfill the purposes we collected it for,
                  including for the purposes of satisfying any legal,
                  accounting, or reporting requirements. Typically, we retain
                  customer order data for 7 years for tax and legal compliance
                  purposes.
                </p>
              </div>

              {/* Children's Privacy */}
              <div id="children" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    8. Children's Privacy
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Our website is not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If you are a parent or guardian and you are
                  aware that your child has provided us with personal
                  information, please contact us.
                </p>
              </div>

              {/* Changes */}
              <div id="changes" className="mb-8 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    9. Changes to This Policy
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last Updated" date at the top. You
                  are advised to review this Privacy Policy periodically for any
                  changes.
                </p>
              </div>

              {/* Contact */}
              <div id="contact" className="mb-4 scroll-mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    10. Contact Us
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {contactEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-gray-900 hover:text-purple-600"
                        >
                          {contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  {contactAddress && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{contactAddress}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Registered Office</p>
                      <p className="text-gray-900">{publisherName}</p>
                    </div>
                  </div>
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
