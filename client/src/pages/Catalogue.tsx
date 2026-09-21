import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { articleAPI } from "@/lib/api";
import {
  Search,
  BookOpen,
  ChevronRight,
  Calendar,
  User,
  Filter,
  X,
} from "lucide-react";

type Article = {
  id: number;
  title: string;
  author: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  cover_image_url: string | null;
  category: string | null;
  isbn: string | null;
  published_year: number | null;
  page_count: number | null;
  language: string | null;
  publisher: string | null;
  stock_quantity: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
};

const ArticleType = {
  BOOK: "book",
  JOURNAL: "journal",
  MAGAZINE: "magazine",
  eBook: "eBook",
} as const;

const getImageUrl = (url: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  return `${baseUrl}${url}`;
};

const ArticleCard = ({ article }: { article: Article }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const getGradient = (type: string) => {
    switch (type) {
      case "book":
        return "from-purple-500 to-indigo-600";
      case "journal":
        return "from-blue-500 to-cyan-600";
      case "magazine":
        return "from-pink-500 to-rose-600";
      case "eBook":
        return "from-green-500 to-emerald-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "book":
        return "bg-purple-100 text-purple-700";
      case "journal":
        return "bg-blue-100 text-blue-700";
      case "magazine":
        return "bg-pink-100 text-pink-700";
      case "eBook":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const imageUrl = getImageUrl(article.cover_image_url);

  return (
    <div
      onClick={() => navigate(`/product/${article.id}`)}
      className="group bg-white rounded-br-3xl rounded-bl-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div
        className={`relative aspect-[3/4] bg-gradient-to-br ${getGradient(article.type)} overflow-hidden`}
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-white/80" />
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <span
            className={`inline-block px-2 py-1 text-xs font-medium uppercase tracking-wider rounded-sm ${getBadgeColor(article.type)}`}
          >
            {article.type}
          </span>
        </div>

        {!article.in_stock || article.stock_quantity === 0 ? (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2 py-1 text-xs font-medium uppercase tracking-wider rounded-sm bg-red-100 text-red-700">
              Out of Stock
            </span>
          </div>
        ) : article.stock_quantity < 5 && article.stock_quantity > 0 ? (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2 py-1 text-xs font-medium uppercase tracking-wider rounded-sm bg-orange-100 text-orange-700">
              Only {article.stock_quantity} left
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="font-serif font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
          <User className="h-3 w-3" />
          by {article.author}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="font-bold text-gray-900">
            {article.currency === "INR"
              ? "₹"
              : article.currency === "USD"
                ? "$"
                : "€"}
            {article.price.toLocaleString()}
          </span>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1">
            View Details
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-gray-200 rounded-sm" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-6 bg-gray-200 rounded w-1/4 mt-2" />
    </div>
  </div>
);

export const Catalogue = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articleAPI.getPublic();
        const responseData = response as any;

        let allArticles: Article[] = [];

        if (
          responseData.data?.articles &&
          Array.isArray(responseData.data.articles)
        ) {
          allArticles = responseData.data.articles;
        } else if (
          responseData.articles &&
          Array.isArray(responseData.articles)
        ) {
          allArticles = responseData.articles;
        } else if (Array.isArray(responseData)) {
          allArticles = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          allArticles = responseData.data;
        } else if (
          responseData.success &&
          Array.isArray(responseData.articles)
        ) {
          allArticles = responseData.articles;
        }

        setArticles(allArticles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredAndSortedArticles = articles
    .filter((article) => {
      const matchesSearch =
        search === "" ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.author.toLowerCase().includes(search.toLowerCase()) ||
        (article.publisher &&
          article.publisher.toLowerCase().includes(search.toLowerCase()));

      const matchesType =
        selectedType === "all" || article.type === selectedType;
      const matchesLanguage =
        selectedLanguage === "all" || article.language === selectedLanguage;
      const isAvailable = article.in_stock && article.stock_quantity > 0;

      return matchesSearch && matchesType && matchesLanguage && isAvailable;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "title-asc":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Complete Catalogue
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Explore our extensive collection of books, journals, magazines, and
            eBooks
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, author, or publisher..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {selectedType !== "all" || selectedLanguage !== "all" ? (
                <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              ) : null}
            </button>

            {/* Sort Dropdown */}
            <select
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>

          {/* Filters Panel */}
          <div
            className={`mt-4 transition-all duration-300 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Type Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded transition-colors ${
                      selectedType === "all"
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    All Types
                  </button>
                  {Object.values(ArticleType).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded transition-colors ${
                        selectedType === type
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Language Filter */}
                <select
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm outline-none focus:border-blue-500"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="all">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(selectedType !== "all" ||
                  selectedLanguage !== "all" ||
                  search) && (
                  <button
                    onClick={() => {
                      setSelectedType("all");
                      setSelectedLanguage("all");
                      setSearch("");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-500">
          Showing {filteredAndSortedArticles.length} of {articles.length}{" "}
          publications
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredAndSortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No publications found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
