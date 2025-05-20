export interface LectureResponseDto {
    id: number;
    title: string;
    content: string;
    price: number;
    lectureLevel: string;
    lectureLevelDescription: string;
    lectureStatus: string;
    lectureStatusDescription: string;
  }
  
  export async function fetchLectureDetail(lectureId: number): Promise<LectureResponseDto> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureId}`);
    if (!res.ok) throw new Error("강의 정보를 불러오지 못했습니다.");
    const data = await res.json();
    return data.data; // ApiResponse.success의 data 필드
  }