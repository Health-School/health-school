import Image from "next/image";
import Link from "next/link";
export default function Header() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Health School Logo"
              width={200}
              height={50}
              className="cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-green-600">
              로그인
            </Link>
            <Link href="/signup" className="text-gray-600 hover:text-green-600">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
