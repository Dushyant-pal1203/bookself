import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { customerOrderAPI } from "@/lib/customerApi";
import { OrderBillPDF } from "@/components/bill/OrderBillPDF";
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Share2,
  CheckCircle,
  Package,
  Truck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useToast } from "@/context/ToastContext";

interface OrderDetails {
  id: number;
  article_id: number;
  article_title: string;
  article_author: string;
  quantity: number;
  total_amount: number;
  status: string;
  payment_method: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  created_at: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
}

interface LocalOrderDetails {
  orderId: string;
  items: any[];
  total: number;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string;
  };
  notes?: string;
  paymentMethod: string;
  orderDate: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const storeInfo = {
  name: "Publishing House",
  address:
    "Office No. 902, 9th Floor, Pegasus Tower, A-10, Block A, Sector 68, Noida, Uttar Pradesh 201309",
  phone: "+91 93100 04022",
  email: "contact@publishinghouse.com",
  gst: "27AAAAA1234B1Z",
};

export const BillDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCustomerAuth();
  const { showError } = useToast();
  const [order, setOrder] = useState<OrderDetails | LocalOrderDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id, user]);

  const loadOrderDetails = async () => {
    setLoading(true);

    try {
      // First check localStorage
      const localOrder = findLocalOrder(id!);
      if (localOrder) {
        setOrder(localOrder);
        setOrderItems(localOrder.items);
        setLoading(false);
        return;
      }

      // Then try API if user is logged in
      if (user && id) {
        const response = await customerOrderAPI.getOrderDetails(Number(id));
        if (response.data?.order) {
          const dbOrder = response.data.order;
          setOrder(dbOrder);
          setOrderItems([
            {
              title: dbOrder.article_title,
              author: dbOrder.article_author,
              quantity: dbOrder.quantity,
              price: dbOrder.total_amount / dbOrder.quantity,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      showError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const findLocalOrder = (orderId: string): LocalOrderDetails | null => {
    const savedOrders = localStorage.getItem("userOrders");
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        const found = orders.find(
          (o: any) =>
            o.orderId === orderId ||
            o.orderId === `#${orderId}` ||
            o.id === parseInt(orderId),
        );
        if (found) return found;
      } catch (e) {}
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const orderIdentifier = order
      ? "id" in order
        ? order.id
        : order.orderId
      : "";

    const shareData = {
      title: `Order Bill #${orderIdentifier}`,
      text: `Check out my order bill from ${storeInfo.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showError("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 max-w-2xl mx-auto">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bill Not Found
        </h2>
        <p className="text-gray-500 mb-4">
          We couldn't find the bill for order #{id}.
        </p>
        <Link
          to="/customer/orders"
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Orders →
        </Link>
      </div>
    );
  }

  const orderId = "orderId" in order ? order.orderId : order.id;
  const orderDate =
    "created_at" in order ? order.created_at : (order as any).orderDate;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2  text-gray-500 hover:text-gray-700 transition-colors duration-200 group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Bill Details
            </h1>
            <p className="text-gray-500 mt-1">
              Order #{orderId} • {formatDate(orderDate)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              variant="secondary"
              className="gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleShare}
              variant="secondary"
              className="gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <PDFDownloadLink
              document={
                <OrderBillPDF
                  order={order}
                  orderItems={orderItems}
                  storeInfo={storeInfo}
                />
              }
              fileName={`invoice_${orderId}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button
                  disabled={pdfLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  {pdfLoading ? "Generating..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">PDF Preview</span>
            <span className="text-xs text-gray-500">
              Use download button for high-quality PDF
            </span>
          </div>
        </div>
        <div className="h-[700px] w-full">
          <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
            <OrderBillPDF
              order={order}
              orderItems={orderItems}
              storeInfo={storeInfo}
            />
          </PDFViewer>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 mt-8">
        <Link to={`/customer/orders/${orderId}`}>
          <Button
            variant="secondary"
            className="gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Button>
        </Link>
        <Link to="/catalogue">
          <Button variant="primary" className="gap-2">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
