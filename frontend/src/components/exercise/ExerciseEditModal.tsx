"use client";

import { useState, useEffect } from "react";

interface Machine {
  id: number;
  name: string;
  body: string[];
  type: string;
}

interface MachineExercise {
  id: number;
  machineId: number;
  machineName: string;
  reps: number;
  sets: number;
  weight: number;
}

interface ExerciseSheet {
  id: number; // Change from optional to required
  exerciseDate: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
  machineExercises: MachineExercise[];
}

interface ExerciseEditModalProps {
  onClose: () => void;
  onSuccess: () => void;
  exerciseSheet: ExerciseSheet;
}

export default function ExerciseEditModal({
  onClose,
  onSuccess,
  exerciseSheet,
}: ExerciseEditModalProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseSheet>({
    id: exerciseSheet.id,
    exerciseDate: exerciseSheet.exerciseDate,
    exerciseStartTime: exerciseSheet.exerciseStartTime,
    exerciseEndTime: exerciseSheet.exerciseEndTime,
    machineExercises: exerciseSheet.machineExercises.map((ex) => ({
      id: ex.id,
      machineId: ex.machineId,
      machineName: ex.machineName,
      reps: ex.reps,
      sets: ex.sets,
      weight: ex.weight,
    })),
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/machines`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("운동 기구 목록 조회 실패");
        const data: Machine[] = await response.json();
        setMachines(data);
      } catch (err) {
        alert("운동 기구 목록을 불러오지 못했습니다.");
      }
    };
    fetchMachines();
  }, []);

  const handleChange = (
    idx: number,
    field: keyof MachineExercise,
    value: number
  ) => {
    const newExercises = [...exerciseData.machineExercises];
    newExercises[idx] = { ...newExercises[idx], [field]: value };
    setExerciseData({ ...exerciseData, machineExercises: newExercises });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/exerciseSheets/${exerciseSheet.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(exerciseData),
        }
      );
      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.message || "운동 기록 수정에 실패했습니다.");
      }
    } catch (err) {
      alert("운동 기록 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Add delete machine exercise handler
  const handleDeleteMachineExercise = async (
    exerciseId: number,
    index: number
  ) => {
    if (!confirm("이 운동을 기록에서 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/machine-exercises/${exerciseId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Remove the exercise from local state
        const newExercises = [...exerciseData.machineExercises];
        newExercises.splice(index, 1);
        setExerciseData({
          ...exerciseData,
          machineExercises: newExercises,
        });
      } else {
        const error = await response.json();
        alert(error.message || "운동 기록 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("운동 기록 삭제 실패:", err);
      alert("운동 기록 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">운동 기록 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                운동 날짜
              </label>
              <input
                type="date"
                value={exerciseData.exerciseDate}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={exerciseData.exerciseStartTime}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={exerciseData.exerciseEndTime}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
          </div>
          <div className="space-y-4">
            {exerciseData.machineExercises.map((exercise, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="grid grid-cols-4 gap-4 w-full">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        운동 기구
                      </label>
                      <select
                        value={exercise.machineId}
                        onChange={(e) =>
                          handleChange(idx, "machineId", Number(e.target.value))
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
                      <label className="block text-sm font-medium mb-1">
                        세트
                      </label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleChange(idx, "sets", Number(e.target.value))
                        }
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        횟수
                      </label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleChange(idx, "reps", Number(e.target.value))
                        }
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        무게(kg)
                      </label>
                      <input
                        type="number"
                        value={exercise.weight}
                        onChange={(e) =>
                          handleChange(idx, "weight", Number(e.target.value))
                        }
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  {exerciseData.machineExercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteMachineExercise(exercise.id, idx)
                      }
                      className="ml-4 text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-4 mt-6">
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
              {loading ? "수정 중..." : "수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
