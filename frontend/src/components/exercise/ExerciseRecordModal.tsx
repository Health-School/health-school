"use client";

import { useState, useEffect } from "react";

interface MachineExercise {
  machineId: number;
  reps: number;
  sets: number;
  weight: number;
}

interface ExerciseSheetCreate {
  exerciseDate: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
  machineExercises: MachineExercise[];
}

interface Machine {
  id: number;
  name: string;
  body: string[];
  type: string;
}

interface ExerciseRecordModalProps {
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: string | null;
}

export default function ExerciseRecordModal({
  onClose,
  onSuccess,
  selectedDate,
}: ExerciseRecordModalProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseSheetCreate>({
    exerciseDate: selectedDate || new Date().toISOString().split("T")[0],
    exerciseStartTime: "",
    exerciseEndTime: "",
    machineExercises: [
      {
        machineId: 0,
        reps: 0,
        weight: 0,
        sets: 0,
      },
    ],
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/machines`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch machines");
        }

        const machines: Machine[] = await response.json();
        setMachines(machines);
      } catch (err) {
        console.error("운동 기구 목록 조회 실패:", err);
      }
    };

    fetchMachines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/exerciseSheets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(exerciseData),
        }
      );

      const result = await response.json();

      if (result.success) {
        onSuccess(); // Call the success callback to refresh parent component
        onClose(); // Close the modal
      } else {
        alert(result.message || "운동 기록 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("운동 기록 저장 실패:", err);
      alert("운동 기록 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    setExerciseData({
      ...exerciseData,
      machineExercises: [
        ...exerciseData.machineExercises,
        { machineId: 0, reps: 0, weight: 0, sets: 0 },
      ],
    });
  };

  const removeExercise = (index: number) => {
    setExerciseData({
      ...exerciseData,
      machineExercises: exerciseData.machineExercises.filter(
        (_, i) => i !== index
      ),
    });
  };

  const updateExercise = (
    index: number,
    field: keyof MachineExercise,
    value: number
  ) => {
    const newExercises = [...exerciseData.machineExercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExerciseData({ ...exerciseData, machineExercises: newExercises });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">운동 기록 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Date and Time Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  운동 날짜
                </label>
                <input
                  type="date"
                  value={exerciseData.exerciseDate}
                  onChange={(e) =>
                    setExerciseData({
                      ...exerciseData,
                      exerciseDate: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작 시간
                </label>
                <input
                  type="time"
                  value={exerciseData.exerciseStartTime}
                  onChange={(e) =>
                    setExerciseData({
                      ...exerciseData,
                      exerciseStartTime: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료 시간
                </label>
                <input
                  type="time"
                  value={exerciseData.exerciseEndTime}
                  onChange={(e) =>
                    setExerciseData({
                      ...exerciseData,
                      exerciseEndTime: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
              {exerciseData.machineExercises.map((exercise, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        운동 기구
                      </label>
                      <select
                        value={exercise.machineId}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "machineId",
                            Number(e.target.value)
                          )
                        }
                        className="w-full border rounded-md px-3 py-2"
                        required
                      >
                        <option value="">선택하세요</option>
                        {machines.map((machine) => (
                          <option key={machine.id} value={machine.id}>
                            {machine.name} ({machine.body.join(", ")})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        세트
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExercise(index, "sets", Number(e.target.value))
                        }
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        횟수
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) =>
                          updateExercise(index, "reps", Number(e.target.value))
                        }
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        무게(kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={exercise.weight}
                        onChange={(e) =>
                          updateExercise(
                            index,
                            "weight",
                            Number(e.target.value)
                          )
                        }
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  {exerciseData.machineExercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="mt-2 text-red-500 text-sm hover:text-red-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addExercise}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600"
            >
              + 운동 추가
            </button>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
