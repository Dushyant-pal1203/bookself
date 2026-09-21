import { useState, useEffect, useRef } from "react";
import { useArticles } from "@/hooks/useArticles";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  Image as ImageIcon,
  FileCheck,
  Eye,
  Archive,
  Package,
  IndianRupee,
  BookOpen,
  Calendar,
  Globe,
  Hash,
  Layers,
  Tag,
  User,
  Type,
  AlignLeft,
  CreditCard,
  // Star,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { articleAPI } from "@/lib/api";

// Enhanced Article Schema with stock quantity
const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  author: z
    .string()
    .min(1, "Author is required")
    .max(100, "Author name is too long"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default("INR"),
  isbn: z.string().optional(),
  category: z.string().optional(),
  published_year: z.number().optional(),
  page_count: z.number().optional(),
  language: z.string().optional(),
  publisher: z.string().optional(),
  stock_quantity: z
    .number()
    .min(0, "Stock quantity must be 0 or more")
    .default(0),
  in_stock: z.boolean().default(true),
  featured: z.boolean().default(false),
  cover_image: z.any().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

// Type badges with colors
const typeConfig: Record<string, { label: string; color: string; bg: string }> =
  {
    book: { label: "Book", color: "text-purple-700", bg: "bg-purple-50" },
    journal: { label: "Journal", color: "text-blue-700", bg: "bg-blue-50" },
    magazine: { label: "Magazine", color: "text-pink-700", bg: "bg-pink-50" },
    eBook: {
      label: "eBook",
      color: "text-green-700",
      bg: "bg-green-50",
    },
  };

// Language options
const languageOptions = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Urdu",
  "Sanskrit",
  "French",
  "German",
  "Spanish",
  "Chinese",
  "Japanese",
  "Arabic",
];

// Category options
const categoryOptions = [
  "Academic",
  "Fiction",
  "Non-Fiction",
  "Science",
  "History",
  "Politics",
  "Literature",
  "Art",
  "Technology",
  "Business",
  "Health",
  "Religion",
  "Philosophy",
  "Children",
  "Reference",
];

export const AdminArticles = () => {
  const {
    articles,
    loading,
    total,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  } = useArticles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      currency: "INR",
      stock_quantity: 0,
      in_stock: true,
      featured: false,
    },
  });

  const watchStockQuantity = watch("stock_quantity");
  const watchInStock = watch("in_stock");
  const watchFeatured = watch("featured");

  // Update in_stock based on stock_quantity
  useEffect(() => {
    if (watchStockQuantity !== undefined) {
      const inStock = watchStockQuantity > 0;
      if (inStock !== watchInStock) {
        setValue("in_stock", inStock);
      }
    }
  }, [watchStockQuantity, setValue, watchInStock]);

  // Filter articles based on search and type
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchTerm === "" ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.isbn && article.isbn.includes(searchTerm));
    const matchesType = selectedType === "all" || article.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all text fields
      formData.append("title", data.title);
      formData.append("author", data.author);
      formData.append("type", data.type);
      if (data.description) formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("currency", data.currency || "INR");
      if (data.isbn) formData.append("isbn", data.isbn);
      if (data.category) formData.append("category", data.category);
      if (data.published_year)
        formData.append("published_year", data.published_year.toString());
      if (data.page_count)
        formData.append("page_count", data.page_count.toString());
      if (data.language) formData.append("language", data.language);
      if (data.publisher) formData.append("publisher", data.publisher);
      formData.append("stock_quantity", data.stock_quantity.toString());
      formData.append("in_stock", String(data.in_stock));
      formData.append("featured", String(data.featured));

      // Append cover image only if a new file is selected
      if (coverFile) {
        formData.append("cover_image", coverFile);
      }

      if (editingArticle) {
        await articleAPI.update(editingArticle.id, formData);
        toast.success("Article updated successfully");
      } else {
        await articleAPI.create(formData);
        toast.success("Article created successfully");
      }

      await fetchArticles();
      handleCloseModal();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(
        error.response?.data?.error ||
          (editingArticle
            ? "Failed to update article"
            : "Failed to create article"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (article: any) => {
    setEditingArticle(article);
    setCoverPreview(null);
    setCoverFile(null);

    // Reset form with article data
    reset({
      title: article.title,
      author: article.author,
      type: article.type,
      description: article.description || "",
      price: article.price,
      currency: article.currency || "INR",
      isbn: article.isbn || "",
      category: article.category || "",
      published_year: article.published_year || undefined,
      page_count: article.page_count || undefined,
      language: article.language || "",
      publisher: article.publisher || "",
      stock_quantity: article.stock_quantity || 0,
      in_stock: article.in_stock,
      featured: article.featured,
    });

    setIsModalOpen(true);
  };

  const handleDeleteClick = (article: any) => {
    setArticleToDelete(article);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (articleToDelete) {
      await deleteArticle(articleToDelete.id);
      setIsDeleteModalOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
    setCoverPreview(null);
    setCoverFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    reset({
      currency: "INR",
      stock_quantity: 0,
      in_stock: true,
      featured: false,
    });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, GIF, or WEBP images are allowed");
        return;
      }

      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverPreview(null);
    setCoverFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Calculate total value correctly based on price * stock_quantity
  const totalArticles = articles.length;
  const totalStockCount = articles.reduce(
    (sum, a) => sum + (a.stock_quantity || 0),
    0,
  );
  const featuredCount = articles.filter((a) => a.featured).length;

  // Fix: Calculate total value as price × stock_quantity for each item
  const totalValue = articles.reduce((sum, a) => {
    const price =
      typeof a.price === "string" ? parseFloat(a.price) : a.price || 0;
    const quantity = a.stock_quantity || 0;
    return sum + price * quantity;
  }, 0);

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Articles Catalogue
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your publications, journals, and books
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingArticle(null);
            setCoverPreview(null);
            setCoverFile(null);
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New Article
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Articles</p>
            <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Archive className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Stock</p>
            <p className="text-2xl font-bold text-green-600">
              {totalStockCount}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Featured</p>
            <p className="text-2xl font-bold text-yellow-600">
              {featuredCount}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <IndianRupee className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Value (INR)</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹
              {typeof totalValue === "number"
                ? totalValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 mt-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "book", "journal", "magazine", "eBook"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedType === type
                    ? type === "all"
                      ? "bg-gray-900 text-white"
                      : `${
                          type === "book"
                            ? "bg-purple-100 text-purple-700"
                            : type === "journal"
                              ? "bg-blue-100 text-blue-700"
                              : type === "magazine"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-green-100 text-green-700"
                        }`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === "all"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cover
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title & Author
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-gray-500">Loading articles...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500">No articles found</p>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingArticle(null);
                          reset();
                          setIsModalOpen(true);
                        }}
                        className="mt-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first article
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => {
                  const typeInfo = typeConfig[article.type] || {
                    label: article.type,
                    color: "text-gray-700",
                    bg: "bg-gray-100",
                  };
                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {article.cover_image_url ? (
                          <img
                            src={`http://localhost:4000${article.cover_image_url}`}
                            alt={article.title}
                            className="h-12 w-10 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                article.cover_image_url,
                              );
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="h-12 w-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            by {article.author}
                          </p>
                          {article.isbn && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              ISBN: {article.isbn}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {article.currency === "INR"
                            ? "₹"
                            : article.currency === "USD"
                              ? "$"
                              : "€"}
                          {article.price}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            (article.stock_quantity || 0) > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {article.stock_quantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            article.in_stock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {article.in_stock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {article.featured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <Star className="h-3 w-3 fill-yellow-500" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(article)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredArticles.length)} of{" "}
              {filteredArticles.length} articles
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {editingArticle ? (
                <Pencil className="h-5 w-5 text-blue-600" />
              ) : (
                <Plus className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingArticle ? "Edit Article" : "Add New Article"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {editingArticle
                  ? "Update the article details below"
                  : "Fill in the details to add a new publication"}
              </p>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Image Upload */}
          <div className="border border-gray-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cover Image
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-32 w-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : editingArticle?.cover_image_url && !coverFile ? (
                  <div className="relative">
                    <img
                      src={`http://localhost:4000${editingArticle.cover_image_url}`}
                      alt="Current cover"
                      className="h-32 w-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      Current
                    </p>
                  </div>
                ) : (
                  <div className="h-32 w-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverImageChange}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {coverPreview ||
                  (editingArticle?.cover_image_url && !coverFile)
                    ? "Change Image"
                    : "Upload Cover"}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or WebP. Max 5 MB.
                </p>
                {editingArticle?.cover_image_url &&
                  !coverFile &&
                  !coverPreview && (
                    <p className="text-xs text-green-600 mt-1">
                      Current image will be kept if you don't upload a new one
                    </p>
                  )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="Enter article title"
                className={`w-full px-4 py-2.5 border ${errors.title ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                {...register("author")}
                placeholder="Author name"
                className={`w-full px-4 py-2.5 border ${errors.author ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.author && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.author.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("type")}
                className={`w-full px-4 py-2.5 border ${errors.type ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select type</option>
                <option value="book">Book</option>
                <option value="journal">Journal</option>
                <option value="magazine">Magazine</option>
                <option value="eBook">eBook</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Enter a detailed description of the article..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Price and Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  {...register("currency")}
                  className="w-20 px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="0.00"
                  className={`flex-1 px-4 py-2.5 w-10 border ${errors.price ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register("category")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN
              </label>
              <input
                {...register("isbn")}
                placeholder="ISBN number"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Published Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published Year
              </label>
              <input
                type="number"
                {...register("published_year", { valueAsNumber: true })}
                placeholder="2024"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Page Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Count
              </label>
              <input
                type="number"
                {...register("page_count", { valueAsNumber: true })}
                placeholder="Number of pages"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                {...register("language")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select language</option>
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publisher
              </label>
              <input
                {...register("publisher")}
                placeholder="Publisher name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("stock_quantity", { valueAsNumber: true })}
                placeholder="Number of copies in stock"
                className={`w-full px-4 py-2.5 border ${errors.stock_quantity ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.stock_quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.stock_quantity.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Number of copies available for sale
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">In Stock</span>
                  <p className="text-xs text-gray-500">
                    Automatically set based on stock quantity
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("in_stock")}
                    disabled
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full ${watchInStock ? "bg-green-500" : "bg-gray-300"} flex items-center opacity-75`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transform transition-transform ${watchInStock ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <span className="font-medium text-gray-700">Featured</span>
                <p className="text-xs text-gray-500">Show on homepage</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${watchFeatured ? "bg-yellow-500" : "bg-gray-300"} flex items-center`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${watchFeatured ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="px-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingArticle ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>{editingArticle ? "Save Changes" : "Create Article"}</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Article"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Deletion
          </h3>
          <p className="text-gray-500 mb-4">
            Are you sure you want to delete "{articleToDelete?.title}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Star component for featured badge
const Star = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
