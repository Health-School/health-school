"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TrainerDashboardSidebar from "@/components/dashboard/TrainerDashboardSidebar";

interface Machine {
  id: number;
  name: string;
  body: string[];
  type: string;
}

// Add new interfaces
interface MachineType {
  id: number;
  name: string;
}

interface BodyPart {
  id: number;
  name: string;
}

interface MachineRegisterRequest {
  name: string;
  machineTypeId: number;
  bodyIds: number[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BodyDto {
  id: number;
  name: string;
}

// Add interface for machine type DTO
interface MachineTypeDto {
  id: number;
  name: string;
}

export default function EquipmentsPage() {
  const pathname = usePathname();
  const [machines, setMachines] = useState<Machine[]>([]);

  // Add new states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [machineName, setMachineName] = useState("");
  const [selectedType, setSelectedType] = useState<number>(0);
  const [selectedBodies, setSelectedBodies] = useState<number[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyDto[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineTypeDto[]>([]);
  const [selectedBodyFilter, setSelectedBodyFilter] = useState<number>(0);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Move fetchMachines outside useEffect
  const fetchMachines = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/machines`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("운동 기구 조회에 실패했습니다.");
      }

      const data = await response.json();
      setMachines(data);
    } catch (error) {
      console.error("운동 기구 조회 오류:", error);
    }
  };

  // Add fetchBodyParts function
  const fetchBodyParts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bodies`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("운동 부위 목록 조회에 실패했습니다.");
      }

      const result: ApiResponse<BodyDto[]> = await response.json();
      if (result.success) {
        setBodyParts(result.data);
      }
    } catch (error) {
      console.error("운동 부위 목록 조회 오류:", error);
    }
  };

  // Add fetchMachineTypes function
  const fetchMachineTypes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/machine-types`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("운동 기구 타입 조회에 실패했습니다.");
      }

      const result: ApiResponse<MachineTypeDto[]> = await response.json();
      if (result.success) {
        setMachineTypes(result.data);
      }
    } catch (error) {
      console.error("운동 기구 타입 조회 오류:", error);
    }
  };

  // Add fetchFilteredMachines function
  const fetchFilteredMachines = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/machines`;

      if (selectedBodyFilter && selectedTypeFilter) {
        url = `${url}/by-body-and-type?bodyId=${selectedBodyFilter}&typeId=${selectedTypeFilter}`;
      } else if (selectedBodyFilter) {
        url = `${url}/by-body?bodyId=${selectedBodyFilter}`;
      } else if (selectedTypeFilter) {
        url = `${url}/by-type?typeId=${selectedTypeFilter}`;
      }

      // url += `&page=${currentPage}&size=10`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("운동 기구 조회에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        setMachines(result.data.content);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error("운동 기구 조회 오류:", error);
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchBodyParts();
    fetchMachineTypes();
  }, []);

  // Update useEffect to handle filters
  useEffect(() => {
    fetchFilteredMachines();
  }, [selectedBodyFilter, selectedTypeFilter, currentPage]);

  // Add register function
  const handleRegister = async () => {
    try {
      if (!machineName || !selectedType || selectedBodies.length === 0) {
        alert("모든 필드를 입력해주세요.");
        return;
      }

      const request: MachineRegisterRequest = {
        name: machineName,
        machineTypeId: selectedType,
        bodyIds: selectedBodies,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/machines/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error("운동 기구 등록에 실패했습니다.");
      }

      alert("운동 기구가 등록되었습니다.");
      setIsModalOpen(false);
      // Refresh machine list
      fetchMachines();

      // Reset form
      setMachineName("");
      setSelectedType(0);
      setSelectedBodies([]);
    } catch (error) {
      console.error("운동 기구 등록 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "운동 기구 등록에 실패했습니다."
      );
    }
  };

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
                운동 기구 신청
              </h1>
              <p className="text-gray-600">
                기구 신청이 가능하고, 기구를 사용하려면 관리자의 승인이
                필요합니다.
              </p>
            </div>

            {/* 필터 섹션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                운동 기구 검색
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운동 부위
                  </label>
                  <select
                    value={selectedBodyFilter}
                    onChange={(e) =>
                      setSelectedBodyFilter(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={0}>전체</option>
                    {bodyParts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기구 타입
                  </label>
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) =>
                      setSelectedTypeFilter(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={0}>전체</option>
                    {machineTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 운동 기구 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    운동 기구 목록
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2 cursor-pointer"
                  >
                    <span>+</span>
                    <span>운동 기구 신청</span>
                  </button>
                </div>

                {machines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            기구 번호
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            기구 이름
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            운동 부위
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            기구 타입
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {machines.map((machine) => (
                          <tr
                            key={machine.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              #{machine.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {machine.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {machine.body.map((part, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    {part}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {machine.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-4xl">🏋️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      등록된 운동 기구가 없습니다
                    </h3>
                    <p className="text-gray-500 mb-6">
                      새로운 운동 기구를 신청해보세요.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      운동 기구 신청하기
                    </button>
                  </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
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
                          onClick={() => setCurrentPage(i)}
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
                        setCurrentPage(
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

      {/* 운동 기구 신청 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                운동 기구 신청
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기구 이름
                </label>
                <input
                  type="text"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="기구 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기구 타입
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={0}>타입을 선택하세요</option>
                  {machineTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  운동 부위
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {bodyParts.map((part) => (
                    <label
                      key={part.id}
                      className="inline-flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBodies.includes(part.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBodies([...selectedBodies, part.id]);
                          } else {
                            setSelectedBodies(
                              selectedBodies.filter((id) => id !== part.id)
                            );
                          }
                        }}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{part.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
