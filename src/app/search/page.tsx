"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ArrowUpRight, ExternalLink, Search } from "lucide-react";
import { searchStories } from "@/lib/db";

interface Story {
  id: number;
  title: string;
  titleZh: string | null;
  url: string | null;
  text: string | null;
  textZh: string | null;
  by: string;
  score: number;
  time: Date;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get("q") || "";
  const searchPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setQuery(searchQuery);
    setCurrentPage(searchPage);
  }, [searchQuery, searchPage]);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query.trim(), searchPage);
    } else {
      setStories([]);
      setTotalPages(0);
    }
  }, [query, searchPage]);

  const performSearch = async (searchQuery: string, page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchStories(searchQuery, page, 20);
      setStories(result.stories);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("搜索失败:", err);
      setError("搜索失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery)}&page=1`);
    } else {
      router.push("/");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    }
  };

  const maxDisplayPages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
  const endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

  return (
    <main className="container mx-auto max-w-7xl px-4 pt-24 pb-8">
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-gray-600" />
          <h1 className="text-2xl font-bold">搜索结果</h1>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="搜索标题或内容..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button
            onClick={() => handleSearch(query)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">搜索中...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
            {error}
          </div>
        )}

        {!isLoading && !error && query && (
          <div>
            <p className="text-gray-600 mb-4">
              找到 {stories.length > 0 ? "约" + currentPage * 20 : 0} 条结果
              (查询: "{query}")
            </p>

            {stories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">没有找到与 "{query}" 相关的结果</p>
                <Link
                  href="/"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                >
                  返回首页
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {stories.map((story) => (
                  <article
                    key={story.id}
                    className="bg-white/50 rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start gap-2">
                      {story.url ? (
                        <a
                          href={story.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-md font-medium hover:text-blue-600 flex items-center gap-1 flex-1"
                        >
                          {story.titleZh || story.title}
                          <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                        </a>
                      ) : (
                        <Link
                          href={`/item/${story.id}`}
                          className="text-lg font-medium hover:text-blue-600 flex-1"
                        >
                          {story.titleZh || story.title}
                        </Link>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>{story.score} 分</span>
                      <span className="mx-2">•</span>
                      <span>作者: {story.by}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {formatDistanceToNow(story.time, {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <a
                        href={`https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 inline-flex items-center"
                      >
                        原帖
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                    {(story.text || story.textZh) && (
                      <div className="mt-3 text-sm text-gray-700 line-clamp-2">
                        {story.textZh || story.text}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    上一页
                  </button>
                )}

                {currentPage > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    1
                  </button>
                )}

                {currentPage > 3 && <span className="px-2">...</span>}

                {Array.from(
                  { length: endPage - startPage + 1 },
                  (_, i) => startPage + i,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-4 py-2 rounded-lg border ${
                      p === currentPage
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {currentPage < totalPages - 2 && (
                  <span className="px-2">...</span>
                )}

                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )}

                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    下一页
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
