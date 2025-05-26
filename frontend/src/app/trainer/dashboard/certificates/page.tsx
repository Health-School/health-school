"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

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

  const tabs = [
    { name: "MY 강의 관리", href: "/trainer/dashboard/my-lectures" },
    { name: "정산 내역", href: "/trainer/dashboard/settlements" },
    { name: "수강생 관리", href: "/trainer/dashboard/students" },
    { name: "상담 일정", href: "/trainer/dashboard/consultations" },
    { name: "운동 기구 신청", href: "/trainer/dashboard/equipments" },
    { name: "MY 자격증 관리", href: "/trainer/dashboard/certificates" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 상단 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-6 py-3 text-sm font-medium ${
                pathname === tab.href
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      <h1 className="text-xl font-bold mb-6">자격증 관리</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  자격증명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  취득일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  만료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  승인상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리자 코멘트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이미지
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certifications.length > 0 ? (
                certifications.map((cert) => (
                  <tr key={cert.certificationId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cert.certificationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cert.acquisitionDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cert.expirationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
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
                    <td className="px-6 py-4">{cert.adminComment || "-"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedImage(cert.imageUrl)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        사진 보기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    등록된 자격증이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchCertifications(i)}
                className={`px-3 py-1 rounded ${
                  currentPage === i
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageModal
          url={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
