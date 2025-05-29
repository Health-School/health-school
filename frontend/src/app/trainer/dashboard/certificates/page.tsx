"use client";

import { useEffect, useState } from "react";
import TrainerDashboardSidebar from "@/components/dashboard/TrainerDashboardSidebar";

interface UserCertification {
  certificationId: number;
  certificationName: string;
  approveStatus: "APPROVAL" | "DISAPPROVAL" | "PENDING";
  imageUrl: string;
  acquisitionDate: string;
  expirationDate: string;
  adminComment: string | null;
}

interface CertificationPage {
  content: UserCertification[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const ImageModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
        >
          ✕
        </button>
        <img src={url} alt="자격증" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default function CertificatesPage() {
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchCertifications = async (page: number = 0) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/usercertifications/me?page=${page}&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("자격증 목록 조회에 실패했습니다.");
      }

      const result = await response.json();
      setCertifications(result.content);
      setTotalPages(result.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("자격증 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <TrainerDashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* 페이지 제목 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                MY 자격증 관리
              </h1>
              <p className="text-gray-600">
                등록한 자격증의 승인 상태를 확인하고 관리하세요.
              </p>
            </div>

            {/* 자격증 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    자격증 목록
                  </h2>
                  <p className="text-sm text-gray-500">
                    총 {certifications.length}개의 자격증
                  </p>
                </div>

                {certifications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            자격증명
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            취득일
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            만료일
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            승인상태
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            관리자 코멘트
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            이미지
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {certifications.map((cert) => (
                          <tr
                            key={cert.certificationId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {cert.certificationName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(
                                  cert.acquisitionDate
                                ).toLocaleDateString("ko-KR")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(
                                  cert.expirationDate
                                ).toLocaleDateString("ko-KR")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  cert.approveStatus === "APPROVAL"
                                    ? "bg-green-100 text-green-800"
                                    : cert.approveStatus === "DISAPPROVAL"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {cert.approveStatus === "APPROVAL"
                                  ? "승인"
                                  : cert.approveStatus === "DISAPPROVAL"
                                    ? "반려"
                                    : "심사중"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {cert.adminComment || (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedImage(cert.imageUrl)}
                                className="text-green-600 hover:text-green-700 font-medium transition-colors cursor-pointer"
                              >
                                사진 보기
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-4xl">🏆</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      등록된 자격증이 없습니다
                    </h3>
                    <p className="text-gray-500 mb-6">
                      자격증을 등록하여 트레이너로서의 전문성을 인증받으세요.
                    </p>
                  </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() =>
                        fetchCertifications(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      이전
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => fetchCertifications(i)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === i
                              ? "bg-green-500 text-white shadow-lg"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        fetchCertifications(
                          Math.min(totalPages - 1, currentPage + 1)
                        )
                      }
                      disabled={currentPage === totalPages - 1}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages - 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
                      }`}
                    >
                      다음
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <ImageModal
          url={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
