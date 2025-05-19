"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const tabs = [
    { name: "MY 강의 관리", href: "/trainer/dashboard/my-lectures" },
    { name: "정산 내역", href: "/trainer/dashboard/settlements" },
    { name: "수강생 관리", href: "/trainer/dashboard/students" },
    { name: "상담 일정", href: "/trainer/dashboard/consultations" },
    { name: "운동 기구 신청", href: "/trainer/dashboard/equipments" },
    { name: "MY 자격증 관리", href: "/trainer/dashboard/certificates" },
  ];

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

  useEffect(() => {
    fetchMachines();
    fetchBodyParts();
    fetchMachineTypes();
  }, []);

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
    <div className="max-w-7xl mx-auto p-6">
      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`${
                pathname === tab.href
                  ? "text-green-500 border-b-2 border-green-500 font-semibold"
                  : "text-gray-500 border-transparent border-b-2 font-medium"
              } py-4 px-2 hover:text-green-700 transition-colors`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">운동 기구 목록</h1>
            <span className="text-sm text-gray-500">
              기구 신청이 가능하고, 기구를 사용하려면 관리자의 승인이 필요합니다
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            운동 기구 신청
          </button>
        </div>

        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  기구 번호
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  기구 이름
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  운동 부위
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  기구 타입
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {machine.id}
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

        {machines.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            운동 기구가 없습니다.
          </div>
        )}

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">운동 기구 신청</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기구 이름
                  </label>
                  <input
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="기구 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기구 타입
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    운동 부위
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Changed to grid layout for better spacing */}
                    {bodyParts.map((part) => (
                      <label key={part.id} className="inline-flex items-center">
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
                          className="mr-2"
                        />
                        <span className="text-sm">{part.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={handleRegister}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  신청하기
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
