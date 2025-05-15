import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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
              <Link
                href="/login"
                className="text-gray-600 hover:text-green-600"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-gray-600 hover:text-green-600"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              건강한 삶을 위한 첫걸음
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              건강 트레이너와의 맞춤형으로 누구나 쉽고 효과적으로 달성하는 꿈
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/trainers"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                >
                  무료 체험 신청하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Classes Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">인기 강의</h2>
            <p className="mt-4 text-gray-500">
              원하는 트레이너와 상담하고 맞춤형 코칭을 받아보세요
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "요가 기초 마스터하기",
                price: "49,000",
                image: "yoga.jpg",
                rating: 4.5,
              },
              {
                title: "효과적인 웨이트 트레이닝",
                price: "59,000",
                image: "weight.jpg",
                rating: 4.8,
              },
              {
                title: "코어 강화 클래스",
                price: "45,000",
                image: "core.jpg",
                rating: 4.3,
              },
              {
                title: "비앤애프터 HIIT 트레이닝",
                price: "55,000",
                image: "hiit.jpg",
                rating: 4.7,
              },
            ].map((course, index) => (
              <div
                key={index}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={`/images/${course.image}`}
                    alt="Class thumbnail"
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600">
                      ₩{course.price}/월
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <div className="mt-2 flex items-center">
                      {[...Array(Math.round(course.rating))].map((_, star) => (
                        <svg
                          key={star}
                          className="h-5 w-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="text-green-600 hover:text-green-700 font-medium">
              더 많은 보기 →
            </button>
          </div>
        </div>
      </div>

      {/* Expert Trainers Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              전문 트레이너
            </h2>
            <p className="mt-4 text-gray-500">
              건강한 트레이닝 가이드와 함께하는 건강한 라이프 스타일
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                name: "박준혁",
                role: "웨이트 트레이닝 2급",
                image: "trainer1.jpg",
              },
              {
                name: "김지연",
                role: "요가 강사",
                image: "trainer2.jpg",
              },
              {
                name: "이수지",
                role: "필라테스 강사",
                image: "trainer3.jpg",
              },
              {
                name: "최동철",
                role: "HIIT 트레이닝 전문",
                image: "trainer4.jpg",
              },
              {
                name: "한미영",
                role: "요가 강사",
                image: "trainer5.jpg",
              },
            ].map((trainer, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <Image
                    src={`/images/trainers/${trainer.image}`}
                    alt={trainer.name}
                    width={200}
                    height={200}
                    className="rounded-lg mx-auto"
                  />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {trainer.name}
                </h3>
                <p className="text-sm text-gray-500">{trainer.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Program Categories */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              프로그램 카테고리
            </h2>
            <p className="mt-4 text-gray-500">
              당신의 목표에 맞는 뷰티 · 건강 · 다이어트 프로그램
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🧘‍♀️",
                title: "요가",
                description: "바디밸런스 개선과 스트레스 해소",
              },
              {
                icon: "💪",
                title: "필라테스",
                description: "코어 강화와 자세 교정",
              },
              {
                icon: "🏋️‍♂️",
                title: "웨이트 트레이닝",
                description: "체계적인 근력 향상 프로그램",
              },
              {
                icon: "📈",
                title: "프로그레시브",
                description: "단계별 맞춤형 운동 프로그램",
              },
            ].map((category, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-medium text-gray-900">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">회원 후기</h2>
            <p className="mt-4 text-gray-500">
              실제 회원들의 생생한 후기를 확인해보세요
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {[
              {
                name: "김미나",
                image: "review1.jpg",
                text: "매일 트레이너님의 지도로 운동하면서 체중감량에 성공했어요. 운동이 이제는 습관이 되었고, 매일이 즐거워요!",
                rating: 5,
              },
              {
                name: "박상우",
                image: "review2.jpg",
                text: "건강해지고 싶어서 시작한 PT인데, 생각보다 더 많은 것을 배우고 있어요. 자세교정부터 식단까지 꼼꼼하게 봐주셔서 감사합니다.",
                rating: 5,
              },
            ].map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Image
                    src={`/images/reviews/${review.image}`}
                    alt={review.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {review.name}
                    </h3>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              헬스쿨과 함께하는 건강한 변화
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { number: "5,000+", label: "누적 회원" },
              { number: "50+", label: "전문 트레이너" },
              { number: "200+", label: "다양한 강의" },
              { number: "98%", label: "만족도" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-extrabold text-green-500">
                  {stat.number}
                </p>
                <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              지금 바로 시작하세요
            </h2>
            <p className="mt-4 text-lg text-green-100">
              건강한 삶으로 향하는 첫걸음, 지금 함께하세요.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button className="bg-white text-green-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100">
                무료 체험 신청하기
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-green-700">
                프로그램 살펴보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                회사소개
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                고객센터
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    href="/contact"
                    className="text-base text-gray-300 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2024 Health School. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
