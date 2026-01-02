import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ArrowUpRight, ExternalLink } from "lucide-react";

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

interface StoryListProps {
  stories: Story[];
  type: string;
  currentPage: number;
}

export default function StoryList({
  stories,
  type,
  currentPage,
}: StoryListProps) {
  // 判断是否是搜索结果（搜索结果不需要分页）
  const isSearchResult = type === "search" || !type;

  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <article key={story.id} className="p-4 rounded-lg border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {story.url ? (
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium hover:underline flex items-center gap-1"
                  >
                    {story.titleZh || story.title}
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={`/item/${story.id}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {story.titleZh || story.title}
                  </Link>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500">
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
            </div>
          </div>
          {story.text && story.textZh && (
            <div className="mt-2 text-sm text-gray-700">{story.textZh}</div>
          )}
        </article>
      ))}

      {!isSearchResult && (
        <div className="flex justify-between items-center mt-6">
          <Link
            href={`/?type=${type}&page=${Math.max(1, currentPage - 1)}`}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            上一页
          </Link>
          <span className="text-sm text-gray-500">第 {currentPage} 页</span>
          <Link
            href={`/?type=${type}&page=${currentPage + 1}`}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            下一页
          </Link>
        </div>
      )}
    </div>
  );
}
