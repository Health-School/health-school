"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

// 타입 정의
interface ChatBotMessageDto {
  message: string;
}

interface ChatUserMessageDto {
  message: string;
}

interface ChatMessageResponseDto {
  message: string;
  sender: "USER" | "BOT";
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<ChatMessageResponseDto[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤을 최하단으로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지가 업데이트될 때마다 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 페이지 로드 시 기존 메시지 불러오기
  useEffect(() => {
    fetchAllMessages();
  }, []);

  // 모든 메시지 가져오기
  const fetchAllMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatBotMessages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const result: ApiResponse<ChatMessageResponseDto[]> =
        await response.json();
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("메시지 불러오기 실패:", error);
    }
  };

  // 사용자 메시지 전송
  const sendUserMessage = async (message: string) => {
    try {
      const userMessageDto: ChatUserMessageDto = { message };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatBotMessages/user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(userMessageDto),
        }
      );
      const result: ApiResponse<ChatMessageResponseDto> = await response.json();
      console.log("사용자 메시지 전송 결과:", result);
      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("사용자 메시지 전송 실패:", error);
      return false;
    }
  };

  // 봇 응답 요청
  const getBotResponse = async (message: string) => {
    try {
      const botMessageDto: ChatBotMessageDto = { message };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatBotMessages/bot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(botMessageDto),
        }
      );
      const result: ApiResponse<ChatMessageResponseDto> = await response.json();
      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
      } else {
        // 에러 메시지 표시
        const errorMessage: ChatMessageResponseDto = {
          message:
            "죄송합니다. 일시적인 문제가 발생했습니다. 다시 시도해주세요.",
          createdAt: new Date().toISOString(),
          sender: "BOT",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("봇 응답 요청 실패:", error);
      const errorMessage: ChatMessageResponseDto = {
        message: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
        createdAt: new Date().toISOString(),
        sender: "BOT",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // 사용자 메시지 전송
    const userMessageSent = await sendUserMessage(userMessage);

    if (userMessageSent) {
      // 봇 응답 요청
      await getBotResponse(userMessage);
    }

    setIsLoading(false);
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <DashboardTabs />
      <div className="flex flex-col h-screen bg-gray-50">
        {/* 페이지 타이틀 */}
        {/* 헤더 */}
        <div className="bg-yellow-200 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                헬스 상담 봇
              </h1>
              <p className="text-sm text-gray-500">
                건강과 운동에 대해 궁금한 것을 물어보세요
              </p>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 bg-blue-200 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium">
                안녕하세요! 헬스 상담 봇입니다.
              </p>
              <p className="text-sm">
                운동이나 건강에 대해 궁금한 것이 있으시면 언제든 물어보세요!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.sender === "USER"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* 아바타 */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === "USER" ? "bg-blue-500" : "bg-green-500"
                  }`}
                >
                  {message.sender === "USER" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* 메시지 버블 */}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === "USER"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "USER"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="bg-gray-100 border-t border-gray-200 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                {/* 입력창 래퍼 */}
                <div className="relative bg-white rounded-2xl border-2 border-gray-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100 transition-all duration-300 shadow-lg">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="헬스 관련 질문을 입력해주세요... 🏋️‍♂️"
                    className="w-full resize-none bg-transparent px-6 py-4 pr-16 rounded-2xl border-0 focus:outline-none placeholder-gray-400 text-gray-900 text-base"
                    rows={1}
                    disabled={isLoading}
                    style={{
                      minHeight: "56px",
                      maxHeight: "120px",
                    }}
                  />

                  {/* 문자 수 표시 */}
                  {inputMessage.length > 0 && (
                    <div className="absolute bottom-2 right-4 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {inputMessage.length}/500
                    </div>
                  )}
                </div>

                {/* 입력 힌트 */}
                {inputMessage.length === 0 && (
                  <div className="absolute -bottom-6 left-4 flex items-center space-x-6 text-xs text-gray-500">
                    <span className="flex items-center bg-white px-2 py-1 rounded-full shadow-sm">
                      <kbd className="bg-gray-100 px-1 rounded text-xs mr-1">
                        Enter
                      </kbd>
                      전송
                    </span>
                    <span className="flex items-center bg-white px-2 py-1 rounded-full shadow-sm">
                      <kbd className="bg-gray-100 px-1 rounded text-xs mr-1">
                        Shift+Enter
                      </kbd>
                      줄바꿈
                    </span>
                  </div>
                )}
              </div>

              {/* 전송 버튼 */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-4 mb-1 rounded-2xl transition-all duration-300 shadow-lg ${
                  inputMessage.trim() && !isLoading
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200 hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* 추천 질문 버튼들 */}
            {messages.length === 0 && (
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <p className="w-full text-center text-sm text-gray-600 mb-3">
                  💡 이런 질문들을 해보세요!
                </p>
                {[
                  "💪 운동 루틴 추천해줘",
                  "🥗 다이어트 식단 알려줘",
                  "🏋️ 근력 운동 방법",
                  "🏠 홈트레이닝 추천",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setInputMessage(suggestion.split(" ").slice(1).join(" "))
                    }
                    className="px-4 py-2 text-sm bg-white hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-full border-2 border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
