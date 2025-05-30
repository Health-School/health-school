"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrainerApplicationPage() {


const router = useRouter();


const removeCertificationBlock = (idToRemove: number) => {
  if (certifications.length <= 1) {
    alert("최소 한 개의 자격증 정보는 유지해야 합니다.");
    return;
  }
  setCertifications(certifications.filter(cert => cert.id !== idToRemove));
};

const [applicantName, setApplicantName] = useState("");
const [careerHistory, setCareerHistory] = useState("");
const [expertiseAreas, setExpertiseAreas] = useState("");
const [selfIntroduction, setSelfIntroduction] = useState("");

// 자격증 정보를 배열로 관리
const [certifications, setCertifications] = useState([
  {
    id: Date.now(), // 각 자격증 블록을 구분하기 위한 고유 ID
    certificationName: "",
    acquisitionDate: "",
    expirationDate: "",
    certificationImage: null as File | null,
  },
]);
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

  const addCertificationBlock = () => {
    setCertifications([
      ...certifications, // 기존 자격증 목록은 그대로 두고
      { // 맨 뒤에 새로운 자격증 객체를 추가
        id: Date.now(), // 새 고유 ID
        certificationName: "",
        acquisitionDate: "",
        expirationDate: "",
        certificationImage: null,
      },
    ]);
  };

const handleCertificationChange = (
  index: number, // 몇 번째 자격증 블록인지 알려주는 index
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  const updatedCertifications = certifications.map((cert, i) =>
    i === index ? { ...cert, [name]: value } : cert
  );
  setCertifications(updatedCertifications);
};

const handleCertificationImageChange = (
  index: number, // 몇 번째 자격증 블록인지 알려주는 index
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const updatedCertifications = certifications.map((cert, i) =>
      i === index ? { ...cert, certificationImage: file } : cert
    );
    setCertifications(updatedCertifications);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    // 1. 유효성 검사 (필수 필드들이 모두 채워졌는지)
    if (!applicantName.trim()) {
      alert("신청서 이름을 입력해주세요.");
      return;
    }
    if (!careerHistory.trim()) {
      alert("경력 사항을 입력해주세요.");
      return;
    }
    if (!expertiseAreas.trim()) {
      alert("전문 분야를 입력해주세요.");
      return;
    }
    if (!selfIntroduction.trim()) {
      alert("자기 소개를 입력해주세요.");
      return;
    }

    // 각 자격증 블록 유효성 검사
    for (let i = 0; i < certifications.length; i++) {
      const cert = certifications[i];
      if (!cert.certificationName) {
        alert(`자격증 #${i + 1}의 자격증 이름을 선택해주세요.`);
        return;
      }
      if (!cert.acquisitionDate) {
        alert(`자격증 #${i + 1}의 발급일을 입력해주세요.`);
        return;
      }
      if (!cert.expirationDate) {
        alert(`자격증 #${i + 1}의 만료일을 입력해주세요.`);
        return;
      }
      if (!cert.certificationImage) {
        alert(`자격증 #${i + 1}의 이미지를 첨부해주세요.`);
        return;
      }
    }

    setLoading(true); // 로딩 시작!

    try {
      // 2. FormData 객체 생성
      const formData = new FormData();

      // 2-1. 신청서 기본 정보와 "모든 자격증의 텍스트 정보"를 담을 DTO 객체 생성

      const trainerApplicationRequestDtoData = {
        name: applicantName,
        careerHistory: careerHistory,
        expertiseAreas: expertiseAreas,
        selfIntroduction: selfIntroduction,
        certifications: certifications.map(cert => ({ // 각 자격증 정보를 CertificationItemDto 모양으로 변환
          certificationName: cert.certificationName,
          acquisitionDate: cert.acquisitionDate,
          expirationDate: cert.expirationDate,
        })),
      };

      // 2-2. 위에서 만든 DTO 객체를 JSON 문자열로 바꿔서 FormData에 추가

      formData.append(
        "trainerApplicationRequestDto",
        new Blob([JSON.stringify(trainerApplicationRequestDtoData)], {
          type: "application/json",
        })
      );

      // 2-3. "모든 자격증 이미지 파일"들을 FormData에 추가
      certifications.forEach((cert) => {
        if (cert.certificationImage) { // 이미지 파일이 있을 때만 추가
          formData.append("certificationImages", cert.certificationImage);
        }
      });

      // 3. 백엔드로 FormData 전송
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/trainerApplications`, // 백엔드 API 주소
        {
          method: "POST",
          credentials: "include", // 쿠키 인증 정보 등을 함께 보내려면 필요
          body: formData,

        }
      );

      // 4. 응답 처리
      if (!response.ok) {
        // 서버에서 에러 응답이 왔을 때
        const errorData = await response.json().catch(() => null); // JSON 파싱 시도
        const errorMessage = errorData?.message || `신청 실패 (상태 코드: ${response.status})`;
        console.error("신청 실패 상세:", errorData); // 콘솔에 에러 상세 내용 출력 (개발용)
        throw new Error(errorMessage); // 에러를 발생시켜서 catch 블록으로 넘김
      }

      // 성공했을 때!
      alert("트레이너 신청이 완료되었습니다. 심사 후 결과를 알려드리겠습니다.");

      // 4-1. 폼 초기화
      setApplicantName("");
      setCareerHistory("");
      setExpertiseAreas("");
      setSelfIntroduction("");
      setCertifications([
        {
          id: Date.now(),
          certificationName: "",
          // issuingInstitution: "", // 이미 삭제했음!
          acquisitionDate: "",
          expirationDate: "",
          certificationImage: null,
        },
      ]);
      // 선택 사항: 특정 페이지로 이동시키기
      router.push("/user/dashboard/my-info"); // 예시: 내 정보 페이지로 이동

    } catch (err: any) { // 타입 명시
      console.error("트레이너 신청 중 에러 발생:", err);
      alert(`트레이너 신청에 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false); // 로딩 끝!
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
          <label className="block font-semibold mb-1">신청자 이름</label>
          <input
            type="text"
            name="applicantName"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">경력 사항</label>
          <textarea
            name="careerHistory"
            value={careerHistory}
            onChange={(e) => setCareerHistory(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 min-h-[60px]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">전문 분야</label>
          <input
            type="text"
            name="expertiseAreas"
            value={expertiseAreas}
            onChange={(e) => setExpertiseAreas(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">자기 소개</label>
          <textarea
            name="selfIntroduction"
            value={selfIntroduction}
            onChange={(e) => setSelfIntroduction(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 min-h-[60px]"
          />
        </div>

       <hr className="my-6" />
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold ">자격증 정보</h2>
         <button
           type="button"
           onClick={addCertificationBlock}
           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
         >
           자격증 추가 +
         </button>
       </div>

        {certifications.map((cert, index) => (
          <div key={cert.id} className="space-y-5 border-t pt-5 mt-5"> {/* 각 자격증 블록을 구분선과 함께 표시 */}
            <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">자격증 {index + 1}</h3>
            {index > 0 && ( // 자격증 블록이 1개 초과일 때만 삭제 버튼 보이기
                    <button
                      type="button"
                      onClick={() => removeCertificationBlock(cert.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      삭제
                    </button>
                  )}
              </div>
            <div>
              <label className="block font-semibold mb-1">자격증 이름</label>
              <select
                name="certificationName"
                value={cert.certificationName}
                onChange={(e) => handleCertificationChange(index, e)} // 변경된 핸들러
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

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">발급일</label>
                <input
                  type="date"
                  name="acquisitionDate"
                  value={cert.acquisitionDate}
                  onChange={(e) => handleCertificationChange(index, e)} // 변경된 핸들러
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">만료일</label>
                <input
                  type="date"
                  name="expirationDate"
                  value={cert.expirationDate}
                  onChange={(e) => handleCertificationChange(index, e)} // 변경된 핸들러
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">자격증 이미지</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleCertificationImageChange(index, e)} // 변경된 핸들러
                required={!cert.certificationImage} // 이미지가 없으면 필수, 있으면 선택
                className="w-full"
              />
              {/* 이미지 미리보기 (선택 사항) */}
              {cert.certificationImage && typeof cert.certificationImage !== 'string' && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(cert.certificationImage)}
                    alt={`자격증 ${index + 1} 미리보기`}
                    className="max-h-40 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

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
