import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { useSettings } from "@/hooks/useSettings";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Clock,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/common/Button";

export const ContactUs = () => {
  const { settings, loading } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = settings?.whatsapp_number || "";
  const contactEmail = settings?.contact_email || "";
  const contactAddress = settings?.contact_address || "";
  const publisherName = settings?.publisher_name || "Publishing House";

  // Format WhatsApp number
  const formatWhatsAppNumber = (number: string) => {
    if (!number) return "";
    let cleaned = number.replace(/\D/g, "");
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - Replace with your actual contact form API
    try {
      // await contactAPI.send(formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <a href="/" className="flex">
              <img
                src="/images/ph-logo.png"
                alt="Logo"
                className="w-40 md:w-64 h-40 md:h-64 mb-2 rounded-full shadow hover:scale-105 hover:shadow-lg hover:shadow-cyan-600 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </a>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Get in touch with us for inquiries, support, or collaboration
            opportunities
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-5">
                {/* Email */}
                {contactEmail && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Us</p>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-gray-900 hover:text-blue-600 transition"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {whatsappNumber && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <a
                        href={`https://wa.me/${formatWhatsAppNumber(whatsappNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-green-600 transition"
                      >
                        {whatsappNumber}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                {contactAddress && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Visit Us</p>
                      <p className="text-gray-900 whitespace-pre-line">
                        {contactAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday:</span>
                  <span className="text-gray-900 font-medium">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="text-gray-900 font-medium">
                    10:00 AM - 4:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="text-gray-900 font-medium">Closed</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-600" />
                Follow Us
              </h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-600">
                  Have a question or feedback? We'd love to hear from you!
                </p>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700">
                    Thank you for reaching out. We'll get back to you within
                    24-48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Book Submission">Book Submission</option>
                        <option value="Order Issue">Order Issue</option>
                        <option value="Payment Related">Payment Related</option>
                        <option value="Collaboration">Collaboration</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mx-auto "
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By submitting this form, you agree to our privacy policy and
                    consent to being contacted regarding your inquiry.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Need Payment Information?
                </h3>
                <p className="text-gray-600 text-sm">
                  Check out our payment methods page for UPI, Bank Transfer, and
                  QR code options
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              className="gap-2 inline-flex duration-200 group"
            >
              <Link to="/payment-methods" className="flex gap-2 items-center">
                View Payment Methods
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Map Section */}
        {contactAddress && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Find Us</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Visit our office at the following location
                </p>
              </div>
              <div className="h-96 bg-gray-100">
                <iframe
                  src="https://www.google.com/maps?q=Office+No.+902,+9th+Floor,+Pegasus+Tower,+A-10,+Block+A,+Sector+68,+Noida,+Uttar+Pradesh+201309&output=embed"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location Map"
                />
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                How quickly do you respond to inquiries?
              </h3>
              <p className="text-gray-600 text-sm">
                We typically respond to all inquiries within 24-48 business
                hours. For urgent matters, please contact us via WhatsApp.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I submit my manuscript for publication?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! We welcome manuscript submissions. Please use the "Book
                Submission" subject line in the contact form, and our editorial
                team will review it.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept UPI payments, bank transfers, and other online payment
                methods. Check our Payment Methods page for detailed
                information.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer international shipping?
              </h3>
              <p className="text-gray-600 text-sm">
                Currently, we ship within India. For international orders,
                please contact us directly to discuss shipping options.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        {whatsappNumber && (
          <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Prefer WhatsApp?
            </h3>
            <p className="text-gray-600 mb-4">
              Chat with us directly on WhatsApp for instant support
            </p>
            <a
              href={`https://wa.me/${formatWhatsAppNumber(whatsappNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
