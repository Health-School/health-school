import { useState } from "react";
import CurriculumUploadTrigger from "@/components/lecture/CurriculumUploadTrigger"; 
import CurriculumUploadModal from "@/components/lecture/CurriculumUploadModal";     
export default function SomePage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>강의 등록</button>
      {open && (
        <CurriculumUploadModal
          lectureId={123}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}