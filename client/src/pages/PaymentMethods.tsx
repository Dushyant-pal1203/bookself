import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { useSettings } from "@/hooks/useSettings";
import {
  CreditCard,
  Smartphone,
  Building2,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  Shield,
  MessageCircle,
} from "lucide-react";

export const PaymentMethods = () => {
  const { settings, loading } = useSettings();
  const [copiedField, setCopiedField] = useState<string>("");
  const [qrError, setQrError] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);

  // Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // Format WhatsApp number for link
  const formatWhatsAppNumber = (number: string) => {
    if (!number) return "";
    // Remove any non-digit characters
    let cleaned = number.replace(/\D/g, "");
    // Remove leading 91 if present (India)
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    // Remove leading 0 if present
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  // Get full QR code URL
  const getFullQRUrl = (qrUrl: string) => {
    if (!qrUrl) return "";
    if (qrUrl.startsWith("http")) return qrUrl;
    // Remove duplicate /uploads
    if (qrUrl.startsWith("/uploads")) return `${API_BASE_URL}${qrUrl}`;
    return `${API_BASE_URL}/uploads/payment/${qrUrl.split("/").pop()}`;
  };

  // Get payment details from settings
  const upiId = settings?.upi_id || "";
  const whatsappNumber = settings?.whatsapp_number || "";
  const paymentInstructions = settings?.payment_instructions || "";
  const accountHolderName = settings?.account_holder_name || "";
  const bankName = settings?.bank_name || "";
  const accountNumber = settings?.account_number || "";
  const ifscCode = settings?.ifsc_code || "";
  const qrCodeUrl = settings?.qr_code_url || "";
  const contactEmail = settings?.contact_email || "";

  const hasUPI = upiId && upiId.trim() !== "";
  const hasBankDetails =
    accountHolderName && bankName && accountNumber && ifscCode;
  const hasQRCode = qrCodeUrl && qrCodeUrl.trim() !== "";
  const hasAnyPaymentMethod = hasUPI || hasBankDetails || hasQRCode;

  // Reset QR states when URL changes
  useEffect(() => {
    setQrError(false);
    setQrLoading(true);
  }, [qrCodeUrl]);

  const handleQrLoad = () => {
    setQrLoading(false);
  };

  const handleQrError = () => {
    setQrError(true);
    setQrLoading(false);
    console.error("QR Code failed to load:", qrCodeUrl);
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
            Payment Methods
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
            Convenient and secure payment options for a seamless checkout
            experience
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* No Payment Methods Configured */}
        {!hasAnyPaymentMethod && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Payment Methods Configured
            </h2>
            <p className="text-gray-600">
              Payment methods are currently being set up. Please check back
              later or contact us directly.
            </p>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${formatWhatsAppNumber(whatsappNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Contact on WhatsApp
              </a>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* UPI Payment Section */}
          {(hasUPI || hasQRCode) && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    UPI Payment
                  </h2>
                </div>
                <p className="text-gray-600 mt-2 text-xs">
                  Pay instantly using any UPI app - Google Pay, PhonePe, Paytm,
                  Amazon Pay, or your bank's UPI
                </p>
              </div>

              <div className="p-4 space-y-2">
                {/* QR Code */}
                {hasQRCode && !qrError && (
                  <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-blue-600" />
                      Scan & Pay
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 rounded-xl shadow-md">
                        {qrLoading && (
                          <div className="w-64 h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        <img
                          src={getFullQRUrl(qrCodeUrl)}
                          alt="UPI QR Code - Scan to Pay"
                          className={`w-64 h-64 object-contain ${qrLoading ? "hidden" : ""}`}
                          onLoad={handleQrLoad}
                          onError={handleQrError}
                        />
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                          Scan this QR code with any UPI app to pay
                        </p>
                        <div className="flex gap-3 justify-center mt-3 flex-wrap">
                          <span className="text-xs bg-white px-2 py-1 rounded shadow-sm">
                            Google Pay
                          </span>
                          <span className="text-xs bg-white px-2 py-1 rounded shadow-sm">
                            PhonePe
                          </span>
                          <span className="text-xs bg-white px-2 py-1 rounded shadow-sm">
                            Paytm
                          </span>
                          <span className="text-xs bg-white px-2 py-1 rounded shadow-sm">
                            Amazon Pay
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code Error Fallback */}
                {hasQRCode && qrError && (
                  <div className="border-2 border-yellow-200 rounded-xl p-4 bg-yellow-50">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      QR Code Unavailable
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      The QR code is temporarily unavailable. Please use the UPI
                      ID below to make your payment.
                    </p>
                  </div>
                )}

                {/* UPI ID */}
                {hasUPI && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      UPI ID (Manual Transfer)
                    </h3>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg flex-wrap gap-2">
                      <code className="text-lg font-mono text-blue-600 break-all">
                        {upiId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(upiId, "UPI ID")}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition flex-shrink-0"
                      >
                        {copiedField === "UPI ID" ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Copy this UPI ID and pay from your preferred UPI app
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank Transfer Section */}
          {hasBankDetails && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bank Transfer
                  </h2>
                </div>
                <p className="text-gray-600 mt-2 text-xs">
                  Transfer directly to our bank account via NEFT, RTGS, or IMPS
                </p>
              </div>

              <div className="p-4 space-y-5">
                <div className="space-y-4">
                  {/* Account Holder Name */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Account Holder Name
                    </label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-medium text-gray-900">
                        {accountHolderName}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(accountHolderName, "Account Name")
                        }
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        {copiedField === "Account Name" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bank Name */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Bank Name
                    </label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-medium text-gray-900">
                        {bankName}
                      </p>
                      <button
                        onClick={() => copyToClipboard(bankName, "Bank Name")}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        {copiedField === "Bank Name" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="border-b border-gray-100 pb-3">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Account Number
                    </label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-mono text-gray-900">
                        {accountNumber}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(accountNumber, "Account Number")
                        }
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        {copiedField === "Account Number" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      IFSC Code
                    </label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-mono uppercase text-gray-900">
                        {ifscCode}
                      </p>
                      <button
                        onClick={() => copyToClipboard(ifscCode, "IFSC Code")}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        {copiedField === "IFSC Code" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        {paymentInstructions && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-2 text-lg">
                  Important Payment Instructions
                </h3>
                <p className="text-yellow-700 whitespace-pre-wrap">
                  {paymentInstructions}
                </p>
                {whatsappNumber && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-2">
                      After making the payment, please send the transaction
                      details to:
                    </p>
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(whatsappNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:border-red-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send Payment Proof on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Secure Payment Guarantee
              </h3>
              <p className="text-gray-600 text-sm">
                All transactions are secure and encrypted. Your payment
                information is protected. Orders are processed only after
                payment confirmation. For any payment-related issues, please
                contact our support team.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                How long does payment confirmation take?
              </h3>
              <p className="text-gray-600 text-sm">
                Payments are typically confirmed within 2-4 hours during
                business hours. You'll receive a confirmation email once your
                payment is verified.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                What if I face issues with UPI payment?
              </h3>
              <p className="text-gray-600 text-sm">
                If you face any issues with UPI payment, you can use the bank
                transfer option or contact us via WhatsApp for assistance.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there any additional charge for online payments?
              </h3>
              <p className="text-gray-600 text-sm">
                No, we do not charge any additional fees for online payments.
                You only pay the displayed amount.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                What details should I share after payment?
              </h3>
              <p className="text-gray-600 text-sm">
                Please share a screenshot of the payment confirmation along with
                your Order ID to our WhatsApp number for faster verification.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Need Help with Payment?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to assist you with any payment-related
            queries
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {whatsappNumber && (
              <a
                href={`https://wa.me/${formatWhatsAppNumber(whatsappNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:border-red-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Support
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:border-red-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Email Support
              </a>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
