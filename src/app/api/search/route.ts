import { NextRequest, NextResponse } from "next/server";
import { searchStories } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        error: "查询参数不能为空",
        results: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      });
    }

    const result = await searchStories(query.trim(), page, limit);

    return NextResponse.json({
      success: true,
      query: query.trim(),
      results: result.stories,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("搜索API错误:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: String(error),
        results: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      },
      { status: 500 },
    );
  }
}
