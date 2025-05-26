import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import removeMarkdown from "remove-markdown";

interface Lecture {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureLevel: string;
  lectureLevelDescription: string;
  lectureStatus: string;
  lectureStatusDescription: string;
}

export default function LectureSearchResult() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q");
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLectures = async () => {
      if (!keyword) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/search?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) throw new Error('검색 중 오류가 발생했습니다.');
        const data = await response.json();
        setLectures(data);
      } catch (error) {
        console.error('검색 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectures();
  }, [keyword]);

  if (!keyword) {
    return <div className="text-center py-8">검색어를 입력해주세요.</div>;
  }

  if (isLoading) {
    return <div className="text-center py-8">검색 중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        "{keyword}" 검색 결과 ({lectures.length}개)
      </h1>
      
      {lectures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <Link 
              href={`/lecture/${lecture.id}`} 
              key={lecture.id}
              className="block p-4 border rounded-lg hover:border-green-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{lecture.title}</h2>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {removeMarkdown(lecture.content)}
                  </p>
                  <div className="flex gap-2 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {lecture.lectureLevelDescription}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {lecture.lectureStatusDescription}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {lecture.price.toLocaleString()}원
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 