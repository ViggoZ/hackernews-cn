import { PrismaClient } from "@prisma/client";
import { HNItem } from "./hn";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error"],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// 添加重试逻辑的包装函数
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 5,
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`尝试第 ${i + 1} 次失败:`, error);

      if (i === maxRetries - 1) break;

      // 如果是连接错误，尝试重新连接
      if (error instanceof Error && error.message.includes("connection")) {
        await prisma.$connect();
      }

      // 指数退避重试
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 10000)),
      );
    }
  }

  throw lastError;
}

export async function createStory(
  item: HNItem,
  translation: { titleZh: string; textZh?: string },
) {
  return withRetry(() =>
    prisma.story.create({
      data: {
        id: item.id,
        title: item.title || "",
        titleZh: translation.titleZh,
        url: item.url,
        text: item.text,
        textZh: translation.textZh,
        by: item.by || "",
        score: item.score || 0,
        descendants: item.descendants || 0,
        time: new Date((item.time || 0) * 1000),
        type: item.type || "story",
        dead: item.dead || false,
        deleted: item.deleted || false,
        kids: item.kids || [],
        translated: true,
      },
    }),
  );
}

export type StoryType = "top" | "new" | "week" | "ask" | "show" | "job";

type OrderBy = {
  score?: "asc" | "desc";
  time?: "asc" | "desc";
}[];

export async function getStoriesByTypes(
  types: StoryType[],
  pageSize: number = 10,
) {
  try {
    const results = await withRetry(async () => {
      const queries = types.map((type) => {
        const baseQuery = {
          deleted: false,
          dead: false,
          type:
            type === "top" || type === "new" || type === "week"
              ? "story"
              : type,
          ...(type === "top"
            ? {
                time: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              }
            : {}),
          ...(type === "week"
            ? {
                time: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              }
            : {}),
        };

        let orderBy: OrderBy;
        switch (type) {
          case "top":
            orderBy = [{ score: "desc" }, { time: "desc" }];
            break;
          case "new":
            orderBy = [{ time: "desc" }];
            break;
          case "week":
            orderBy = [{ score: "desc" }];
            break;
          default:
            orderBy = [{ score: "desc" }, { time: "desc" }];
        }

        return prisma.story.findMany({
          where: baseQuery,
          orderBy,
          take: pageSize,
        });
      });

      return Promise.all(queries);
    });

    return results;
  } catch (error) {
    console.error(
      "查询文章失败:",
      error instanceof Error ? error.message : error,
    );
    return types.map(() => []); // 返回空数组数组
  }
}

export async function getStories(
  type: StoryType = "top",
  page: number = 1,
  pageSize: number = 20,
) {
  const skip = (page - 1) * pageSize;

  try {
    return await withRetry(async () => {
      const baseQuery = {
        deleted: false,
        dead: false,
        type:
          type === "new"
            ? "story"
            : type === "top" || type === "week"
              ? "story"
              : type,
        ...(type === "top"
          ? {
              time: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            }
          : {}),
        ...(type === "week"
          ? {
              time: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            }
          : {}),
      };

      let orderBy: OrderBy;
      switch (type) {
        case "top":
          orderBy = [{ score: "desc" }, { time: "desc" }];
          break;
        case "new":
          orderBy = [{ time: "desc" }];
          break;
        case "week":
          orderBy = [{ score: "desc" }];
          break;
        default:
          orderBy = [{ score: "desc" }, { time: "desc" }];
      }

      const [stories, total] = await Promise.all([
        prisma.story.findMany({
          where: baseQuery,
          orderBy,
          skip,
          take: pageSize,
        }),
        prisma.story.count({
          where: baseQuery,
        }),
      ]);

      return {
        stories,
        total,
        totalPages: Math.ceil(total / pageSize),
      };
    });
  } catch (error) {
    console.error(
      "查询文章失败:",
      error instanceof Error ? error.message : error,
    );
    return {
      stories: [],
      total: 0,
      totalPages: 0,
    };
  }
}

export async function getStory(id: number) {
  return withRetry(() =>
    prisma.story.findUnique({
      where: { id },
    }),
  );
}

export async function storyExists(id: number): Promise<boolean> {
  const count: number = await withRetry(() =>
    prisma.story.count({
      where: { id },
    }),
  );
  return count > 0;
}

// 搜索功能
export async function searchStories(
  query: string,
  page: number = 1,
  pageSize: number = 20,
) {
  const skip = (page - 1) * pageSize;

  try {
    // 搜索标题（中英文）和内容（中英文）
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { titleZh: { contains: query, mode: "insensitive" } },
            { text: { contains: query, mode: "insensitive" } },
            { textZh: { contains: query, mode: "insensitive" } },
          ],
          deleted: false,
          dead: false,
        },
        orderBy: [{ score: "desc" }, { time: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.story.count({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { titleZh: { contains: query, mode: "insensitive" } },
            { text: { contains: query, mode: "insensitive" } },
            { textZh: { contains: query, mode: "insensitive" } },
          ],
          deleted: false,
          dead: false,
        },
      }),
    ]);

    return {
      stories,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error(
      "搜索文章失败:",
      error instanceof Error ? error.message : error,
    );
    return {
      stories: [],
      total: 0,
      totalPages: 0,
    };
  }
}

export default prisma;
