"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrainerApplicationPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    certificationName: "",
    careerHistory: "",
    expertiseAreas: "",
    selfIntroduction: "",
    issuingInstitution: "",
    acquisitionDate: "",
    expirationDate: "",
  });
  const [certificationImage, setCertificationImage] = useState<File | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [certCategories, setCertCategories] = useState<string[]>([]);

  // 자격증 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/certification-categories`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // CertificationCategoryDto에 name 필드가 있다고 가정
          setCertCategories(data.data.map((cat: any) => cat.name));
        }
      } catch (err) {
        setCertCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificationImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificationImage) {
      alert("자격증 이미지를 첨부해주세요.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        "trainerApplicationRequestDto",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );
      formData.append("certificationImage", certificationImage);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/trainerApplications`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      if (!response.ok) throw new Error("신청 실패");
      alert("트레이너 신청이 완료되었습니다.");
      setForm({
        name: "",
        certificationName: "",
        careerHistory: "",
        expertiseAreas: "",
        selfIntroduction: "",
        issuingInstitution: "",
        acquisitionDate: "",
        expirationDate: "",
      });
      setCertificationImage(null);
      router.push("/user/dashboard/my-info");
    } catch (err) {
      alert("트레이너 신청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">트레이너 신청</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        encType="multipart/form-data"
      >
        <div>
          <label className="block font-semibold mb-1">신청서 이름</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">자격증 이름</label>
          <select
            name="certificationName"
            value={form.certificationName}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="">자격증을 선택하세요</option>
            {certCategories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">발급처</label>
          <input
            type="text"
            name="issuingInstitution"
            value={form.issuingInstitution}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">발급일</label>
            <input
              type="date"
              name="acquisitionDate"
              value={form.acquisitionDate}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">만료일</label>
            <input
              type="date"
              name="expirationDate"
              value={form.expirationDate}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">경력 사항</label>
          <textarea
            name="careerHistory"
            value={form.careerHistory}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 min-h-[60px]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">전문 분야</label>
          <input
            type="text"
            name="expertiseAreas"
            value={form.expertiseAreas}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">자기 소개</label>
          <textarea
            name="selfIntroduction"
            value={form.selfIntroduction}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 min-h-[60px]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">자격증 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
        >
          {loading ? "신청 중..." : "트레이너 신청"}
        </button>
      </form>
    </div>
  );
}
