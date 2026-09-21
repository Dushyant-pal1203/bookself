// src/components/bill/OrderBillPDF.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    backgroundColor: "#FFF",
  },
  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    // paddingBottom: 10,
    backgroundColor: "#16263F",
    borderRadius: "8",
    borderBottom: "2px solid #e0e7ff",
    borderTop: "2px solid #e0e7ff",
  },
  logoSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    marginTop: "10",
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: "contain",
    marginBottom: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  storeTagline: {
    fontSize: 9,
    // color: "#6b7280",
    color: "#F3F4F6",
    marginBottom: 2,
  },
  billTitleSection: {
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    // backgroundColor: "#16263F",
    paddingVertical: "10px",
    borderRadius: "30px",
    marginBottom: 15,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE9900",
    letterSpacing: 1,
  },
  billBadge: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  billSubtitle: {
    fontSize: 8,
    color: "#000",
    fontWeight: "bold",
  },
  // Status card styles
  statusCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderLeft: "4px solid",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLeft: {
    flexDirection: "column",
  },
  statusLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statusIcon: {
    fontSize: 24,
  },
  // Info grid styles
  infoGrid: {
    flexDirection: "row",
  },
  infoColumn: {
    flex: 1,
    marginRight: 10,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1e1b4b",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "2px solid #e0e7ff",
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    color: "#1e293b",
  },
  // Table styles
  table: {
    marginVertical: 15,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#16263F",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowAlternate: {
    backgroundColor: "#faf9ff",
  },
  col1: { width: "35%" },
  col2: { width: "25%" },
  col3: { width: "15%", textAlign: "center" },
  col4: { width: "25%", textAlign: "right" },
  headerText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FE9901",
  },
  cellText: {
    fontSize: 9,
    color: "#334155",
  },
  productTitle: {
    fontWeight: "bold",
    color: "#1e1b4b",
  },
  // Total section styles
  totalSection: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalCard: {
    width: 280,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    border: "1px solid #e2e8f0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 9,
    color: "#64748b",
  },
  totalValue: {
    fontSize: 9,
    color: "#334155",
    fontWeight: "bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#e0e7ff",
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FE9901",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FE9901",
  },
  // Payment summary styles
  paymentSummary: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    border: "1px solid #bbf7d0",
  },
  paymentText: {
    fontSize: 8,
    color: "#166534",
    textAlign: "center",
  },
  // Footer styles
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  thankYouText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FE9901",
    marginBottom: 4,
  },
});

interface OrderBillPDFProps {
  order: any;
  orderItems: any[];
  storeInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst?: string;
  };
}

export const OrderBillPDF = ({
  order,
  orderItems,
  storeInfo,
}: OrderBillPDFProps) => {
  // Helper functions to safely get data from either API or local storage
  const getOrderId = () => order?.id || order?.orderId || "N/A";
  const getOrderDate = () =>
    order?.created_at || order?.orderDate || new Date().toISOString();
  const getCustomerName = () =>
    order?.customer_name || order?.customer?.name || "Customer";
  const getCustomerPhone = () =>
    order?.customer_phone || order?.customer?.phone || "N/A";
  const getCustomerEmail = () =>
    order?.customer_email || order?.customer?.email || "";
  const getCustomerAddress = () =>
    order?.customer_address || order?.customer?.address || "N/A";
  const getPaymentMethod = () => {
    const method = order?.payment_method || order?.paymentMethod;
    const methodMap: Record<string, string> = {
      bank_transfer: "Bank Transfer / UPI",
      credit_card: "Credit Card",
      debit_card: "Debit Card",
      cash: "Cash on Delivery",
    };
    return methodMap[method] || method || "N/A";
  };
  const getTotalAmount = () => order?.total_amount || order?.total || 0;
  const getStatus = () => order?.status || "pending";
  const getShippingCharge = () => order?.shipping_charge || 0;

  const getStatusColor = () => {
    const status = getStatus();
    const colorMap: Record<string, string> = {
      delivered: "#10b981",
      shipped: "#8b5cf6",
      processing: "#3b82f6",
      cancelled: "#ef4444",
      pending: "#f59e0b",
    };
    return colorMap[status?.toLowerCase()] || "#6b7280";
  };

  const getStatusIcon = () => {
    const status = getStatus();
    const iconMap: Record<string, string> = {
      delivered: "",
      shipped: "",
      processing: "",
      pending: "",
      cancelled: "",
    };
    return iconMap[status?.toLowerCase()] || "";
  };

  const getStatusText = () => {
    const status = getStatus();
    const map: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return map[status?.toLowerCase()] || status || "Pending";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src="/images/ph-logo.png" />
            <View>
              <Text style={styles.storeName}>{storeInfo.name}</Text>
              <Text style={styles.storeTagline}>{storeInfo.address}</Text>
              <Text style={styles.storeTagline}>{storeInfo.phone}</Text>
              <Text style={styles.storeTagline}>{storeInfo.email}</Text>
              {storeInfo.gst && (
                <Text style={styles.storeTagline}>GST: {storeInfo.gst}</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.billTitleSection}>
          <Text style={styles.billTitle}>TAX INVOICE</Text>
          <View style={styles.billBadge}>
            <Text style={styles.billSubtitle}> Order Id. #{getOrderId()}</Text>
          </View>
        </View>

        {/* Status Card */}
        {/* <View
          style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}
        >
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>Order Status</Text>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        </View> */}

        {/* Customer Information - Two Column Layout */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}> Bill To</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer:</Text>
                <Text style={styles.infoValue}>{getCustomerName()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{getCustomerPhone()}</Text>
              </View>
              {getCustomerEmail() && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{getCustomerEmail()}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoColumn}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Delivery & Payment</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Delivery:</Text>
                <Text style={styles.infoValue}>{getCustomerAddress()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(getOrderDate()).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment:</Text>
                <Text style={styles.infoValue}>{getPaymentMethod()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.col1]}>
              Item Description
            </Text>
            <Text style={[styles.headerText, styles.col2]}>Author</Text>
            <Text style={[styles.headerText, styles.col3]}>Qty</Text>
            <Text style={[styles.headerText, styles.col4]}>Amount</Text>
          </View>

          {orderItems && orderItems.length > 0 ? (
            orderItems.map((item, index) => (
              <View
                key={index}
                style={
                  index % 2 === 1
                    ? [styles.tableRow, styles.tableRowAlternate]
                    : styles.tableRow
                }
              >
                <Text
                  style={[styles.cellText, styles.col1, styles.productTitle]}
                >
                  {item.title || item.article_title || "Product"}
                </Text>
                <Text style={[styles.cellText, styles.col2]}>
                  {item.author || item.article_author || "Unknown"}
                </Text>
                <Text style={[styles.cellText, styles.col3]}>
                  {item.quantity || 1}
                </Text>
                <Text style={[styles.cellText, styles.col4]}>
                  Rs.
                  {(
                    (item.price || getTotalAmount() / (item.quantity || 1)) *
                    (item.quantity || 1)
                  ).toLocaleString("en-IN")}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.col1]}>No items found</Text>
              <Text style={[styles.cellText, styles.col2]}></Text>
              <Text style={[styles.cellText, styles.col3]}></Text>
              <Text style={[styles.cellText, styles.col4]}></Text>
            </View>
          )}
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                Rs.{getTotalAmount().toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping Charges</Text>
              <Text style={styles.totalValue}>
                Rs.{getShippingCharge().toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                Rs.
                {(getTotalAmount() + getShippingCharge()).toLocaleString(
                  "en-IN",
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentSummary}>
          <Text style={styles.paymentText}>
            Payment received via{" "}
            {getPaymentMethod()
              .replace(/[💰💳💵]/g, "")
              .trim()}{" "}
            • Order{" "}
            <Text style={[{ color: getStatusColor() }]}>
              {getStatusText()}
            </Text>{" "}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYouText}>
            Thank you for choosing {storeInfo.name}!
          </Text>
          <Text style={styles.footerText}>
            For any queries, contact us at {storeInfo.phone} or email{" "}
            {storeInfo.email}
          </Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>
            This is a computer-generated invoice and does not require a physical
            signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
