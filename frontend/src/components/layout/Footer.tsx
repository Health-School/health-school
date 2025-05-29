import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 w-full mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-left text-gray-300 space-y-2">
          <p>
            고객의 소중한 의견을 바탕으로 더 나은 서비스를 제공하기 위해
            노력합니다.
            <br />
            고객님의 소중한 의견을 언제든지 환영합니다.
          </p>
          <p className="mt-4">
            <span className="font-semibold">팀장:</span> 강성민 ㅣ{" "}
            <span className="font-semibold">부팀장:</span> 강준호 ㅣ{" "}
            <span className="font-semibold">팀원 :</span> 권태윤, 최정인, 유광륜
          </p>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-left">
            &copy; 2025 healthschool. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
