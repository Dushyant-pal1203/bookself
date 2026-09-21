import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { articleAPI } from "@/lib/api";
import { Article } from "@/types/article";

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await articleAPI.getAll();
      setArticles(response.data.articles);
      setTotal(response.data.total || response.data.articles.length);
    } catch (error) {
      toast.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (data: Partial<Article>) => {
    try {
      const response = await articleAPI.create(data);
      toast.success("Article created successfully");
      await fetchArticles();
      return response.data;
    } catch (error) {
      toast.error("Failed to create article");
      throw error;
    }
  };

  const updateArticle = async (id: number, data: Partial<Article>) => {
    try {
      const response = await articleAPI.update(id, data);
      toast.success("Article updated successfully");
      await fetchArticles();
      return response.data;
    } catch (error) {
      toast.error("Failed to update article");
      throw error;
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      await articleAPI.delete(id);
      toast.success("Article deleted successfully");
      await fetchArticles();
    } catch (error) {
      toast.error("Failed to delete article");
      throw error;
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    total,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};
