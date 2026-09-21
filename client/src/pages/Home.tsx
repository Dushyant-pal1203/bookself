import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { articleAPI } from "@/lib/api";
import {
  Search,
  BookOpen,
  Star,
  ChevronRight,
  Calendar,
  User,
  Package,
} from "lucide-react";

const ArticleType = {
  BOOK: "book",
  JOURNAL: "journal",
  MAGAZINE: "magazine",
  NEWSPAPER: "newspaper",
} as const;

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

const getImageUrl = (url: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  return `${baseUrl}${url}`;
};

const ArticleCard = ({ article }: { article: Article }) => {
  const navigate = useNavigate();

  const getGradient = (type: string) => {
    switch (type) {
      case "book":
        return "from-purple-500 to-indigo-600";
      case "journal":
        return "from-blue-500 to-cyan-600";
      case "magazine":
        return "from-pink-500 to-rose-600";
      case "newspaper":
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
      case "newspaper":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const imageUrl = getImageUrl(article.cover_image_url);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    navigate(`/product/${article.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-br-3xl rounded-bl-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div
        className={`relative aspect-[3/4] bg-gradient-to-br ${getGradient(article.type)} overflow-hidden`}
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-white/80" />
          </div>
        )}

        {article.featured && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-sm text-xs font-semibold">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </div>
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
        <div className="flex justify-between gap-1 h-20">
          <div>
            <h3 className="font-serif font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <User className="h-3 w-3" />
              by {article.author}
            </p>
          </div>

          <div>
            {article.published_year && (
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {article.published_year}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="font-bold text-gray-900 flex items-center gap-1">
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

const weeklySchedule = {
  Monday: [{ title: "Journal of South Asian Studies", subtitle: "Vol. 11" }],
  Tuesday: [{ title: "Quiet Library", subtitle: "Morgan Nichols" }],
  Wednesday: [{ title: "The Human Review", subtitle: "Spring Issue" }],
  Thursday: [{ title: "The Quiet Library", subtitle: "Alan's Beasts" }],
  Friday: [
    { title: "Journal of South Asian Studies", subtitle: "Vol. 12" },
    { title: "The European Review", subtitle: "Spring Issue" },
  ],
};

export const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

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
        const featured = allArticles.filter((a: Article) => a.featured);
        setFeaturedArticles(
          featured.length > 0 ? featured.slice(0, 3) : allArticles.slice(0, 3),
        );
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      search === "" ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.author.toLowerCase().includes(search.toLowerCase()) ||
      (article.isbn && article.isbn.includes(search)) ||
      (article.publisher &&
        article.publisher.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedType === "all" || article.type === selectedType;
    const isAvailable = article.in_stock && article.stock_quantity > 0;
    return matchesSearch && matchesType && isAvailable;
  });

  const isCatalogLoading = loading;
  const isArticlesLoading = loading;

  return (
    <div>
      <Header />

      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center justify-items-center">
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
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Stories that shape minds
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover our collection of academic journals, literary works, and
            cultural publications
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 space-y-16">
        {!isCatalogLoading && featuredArticles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
              <h2 className="font-serif text-3xl text-gray-900">
                Featured Releases
              </h2>
              <button
                onClick={() =>
                  document
                    .getElementById("catalogue")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        <section id="catalogue">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-200 pb-4 gap-4">
            <h2 className="font-serif text-3xl text-gray-900">
              Complete Catalogue
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search titles, authors..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm outline-none text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex bg-white p-1 rounded-sm border border-gray-200 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setSelectedType("all")}
                  className={`px-3 py-1 h-8 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${
                    selectedType === "all"
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                {Object.values(ArticleType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 h-8 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${
                      selectedType === type
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isArticlesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-sm border border-gray-200 border-dashed">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="font-serif text-xl text-gray-900 mb-2">
                No publications found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any items matching your search criteria. Try
                adjusting your filters.
              </p>
              {(search || selectedType !== "all") && (
                <button
                  className="mt-6 px-4 py-2 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSearch("");
                    setSelectedType("all");
                  }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl text-gray-900 mb-8 text-center">
            Weekly Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(weeklySchedule).map(([day, items]) => (
              <div
                key={day}
                className="bg-white rounded-lg p-4 shadow-sm border hover:scale-105 transition-all duration-200 border-gray-100 hover:shadow-md "
              >
                <h3 className="font-bold text-blue-600 mb-3 text-sm tracking-wider">
                  {day.toUpperCase()}
                </h3>
                {items.map((item, idx) => (
                  <div key={idx} className="mb-3 last:mb-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `;
  if (!document.querySelector("#home-styles")) {
    style.id = "home-styles";
    document.head.appendChild(style);
  }
}
