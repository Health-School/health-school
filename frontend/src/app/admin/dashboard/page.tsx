"use client";

import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from 'echarts'


interface MetricWidgetDto {
  metricName: string;
  currentValue: number;
  percentageChange: number | null;
}

interface DataPoint { date: string; value: number; }
interface ChartDataDto {
  chartName?: string;
  dataPoints: DataPoint[];
}

const metricDisplayConfig: {
  [key: string]: {
    icon: string;
    bgColor: string;
    textColor: string;
    displayName: string;
  };
} = {
  "총 사용자 수": {
    icon: "fa-solid fa-users",
    bgColor: "bg-green-100",
    textColor: "text-green-500",
    displayName: "전체 사용자 수",
  },
  "총 강의 수": {
    icon: "fa-solid fa-book-open",
    bgColor: "bg-blue-100",
    textColor: "text-blue-500",
    displayName: "전체 강의 수",
  },
  "오늘 총 결제 건수": {
    icon: "fa-solid fa-credit-card",
    bgColor: "bg-purple-100",
    textColor: "text-purple-500",
    displayName: "결제 건수",
  },

  // "신고 건수": {
  //   icon: "fa-solid fa-flag",
  //   bgColor: "bg-red-100",
  //   textColor: "text-red-500",
  //   displayName: "신고 건수",
  // },
};

interface Notice {
  id: number;
  title: string;
  author: string;
  date: string;
  status: string;
  views: number;
  content?: string;
}

const DashboardPageContent: React.FC = () => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [userChartPeriod, setUserChartPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");

  const [metrics, setMetrics] = useState<MetricWidgetDto[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [userGrowthData, setUserGrowthData] = useState<ChartDataDto | null>(
    null
  );
  const [userGrowthLoading, setUserGrowthLoading] = useState<boolean>(true);
  const [userGrowthError, setUserGrowthError] = useState<string | null>(null);

  // 결제 금액 추이 차트 데이터
  const [salesAmountData, setSalesAmountData] = useState<ChartDataDto | null>(
    null
  );

  const [salesAmountLoading, setSalesAmountLoading] = useState<boolean>(true);
  const [salesAmountError, setSalesAmountError] = useState<string | null>(null);
  const [salesChartPeriod, setSalesChartPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  //   const handleViewNotice = (notice: Notice) => {
  //     setSelectedNotice({
  //       ...notice,
  //       content: `이것은 "${notice.title}"의 상세 내용입니다. 공지사항의 전체 내용이 여기에 표시됩니다. 실제 구현 시에는 서버에서 해당 공지사항의 전체 내용을 불러와야 합니다.
  // 주요 내용:
  // 1. 공지사항의 목적과 배경
  // 2. 상세 설명 및 안내사항
  // 3. 적용 일정 및 범위
  // 4. 문의 및 연락처
  // 사용자들은 이 모달을 통해 공지사항의 전체 내용을 확인할 수 있습니다.`,
  //     });
  //     setIsNoticeModalOpen(true);
  //   };

  const closeNoticeModal = () => {
    setIsNoticeModalOpen(false);
    setSelectedNotice(null);
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/dashboard/key-metrics`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            // 403 Forbidden (권한 없음) 에러 처리
            throw new Error(
              "지표 데이터를 불러올 권한이 없습니다. 관리자 계정으로 로그인해주세요."
            );
          }

          const errorData = await response.json().catch(() => ({
            message: `서버 응답 에러! 상태 코드: ${response.status}`,
          }));
          throw new Error(
            errorData.message ||
              `데이터를 불러오는데 실패했습니다. 상태 코드: ${response.status}`
          );
        }

        const result: {
          success: boolean;
          data: MetricWidgetDto[];
          message: string;
        } = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setMetrics(result.data);
        } else {
          throw new Error(
            result.message || "데이터 형식이 올바르지 않거나 데이터가 없습니다."
          );
        }
      } catch (err: any) {
        setMetricsError(err.message);
        console.error("핵심 지표 데이터 가져오기 에러:", err);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchUserGrowthData = async () => {
      setUserGrowthLoading(true);
      setUserGrowthError(null);
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/dashboard/user-growth-trend?interval=${userChartPeriod}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          if (response.status === 403)
            throw new Error(
              "사용자 증가 추이 데이터를 불러올 권한이 없습니다."
            );
          const errorData = await response.json().catch(() => ({
            message: `HTTP error! status: ${response.status}`,
          }));
          throw new Error(
            errorData.message ||
              `사용자 증가 추이 데이터 로딩 실패: ${response.status}`
          );
        }
        const result: {
          success: boolean;
          data: ChartDataDto;
          message: string;
        } = await response.json();
        if (result.success && result.data) {
          setUserGrowthData(result.data);
        } else {
          throw new Error(
            result.message ||
              "사용자 증가 추이 데이터 형식이 올바르지 않습니다."
          );
        }
      } catch (err: any) {
        setUserGrowthError(err.message);
        console.error("Error fetching user growth data:", err);
      } finally {
        setUserGrowthLoading(false);
      }
    };
    fetchUserGrowthData();
  }, [userChartPeriod]);

  useEffect(() => {
    const fetchSalesAmountData = async () => {
      setSalesAmountLoading(true);
      setSalesAmountError(null);
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8090";

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/dashboard/sales-amount-trend?interval=${salesChartPeriod}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          if (response.status === 403)
            throw new Error("결제 금액 추이 데이터를 불러올 권한이 없습니다.");
          const errorData = await response.json().catch(() => ({
            message: `HTTP error! status: ${response.status}`,
          }));
          throw new Error(
            errorData.message ||
              `결제 금액 추이 데이터 로딩 실패: ${response.status}`
          );
        }
        const result: {
          success: boolean;
          data: ChartDataDto;
          message: string;
        } = await response.json();
        if (result.success && result.data) {
          setSalesAmountData(result.data);
        } else {
          throw new Error(
            result.message || "결제 금액 추이 데이터 형식이 올바르지 않습니다."
          );
        }
      } catch (err: any) {
        setSalesAmountError(err.message);
        console.error("Error fetching sales amount data:", err);
      } finally {
        setSalesAmountLoading(false);
      }
    };
    fetchSalesAmountData();
  }, [salesChartPeriod]);

  useEffect(() => {
    const userChartElement = document.getElementById("userGrowthChart");
    if (userChartElement) {
      const userChart =
        echarts.getInstanceByDom(userChartElement) ||
        echarts.init(userChartElement);
      if (userGrowthLoading) {
        userChart.showLoading();
      } else if (userGrowthError) {
        userChartElement.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 p-4">⚠️ 사용자 증가 추이 로딩 실패: ${userGrowthError}</div>`;
      } else if (
        userGrowthData &&
        userGrowthData.dataPoints &&
        userGrowthData.dataPoints.length > 0
      ) {
        userChart.hideLoading();
        const userOption: EChartsOption = {
          animation: false,
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: {
            type: "category" as const,
            data: userGrowthData.dataPoints.map((dp) => dp.date),
          },
          yAxis: { type: "value" as const },
          series: [
            {
              name: userGrowthData.chartName || "사용자 수",
              type: "line" as const,
              smooth: true,
              data: userGrowthData.dataPoints.map((dp) => dp.value),
              itemStyle: { color: "#2ECC71" },
              areaStyle: {
                color: {
                  type: "linear" as const,
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(46, 204, 113, 0.5)" },
                    { offset: 1, color: "rgba(46, 204, 113, 0.1)" },
                  ],
                },
              },
            },
          ],
        };
        userChart.setOption(userOption);
      } else {
        userChart.hideLoading();
        userChartElement.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 p-4">📈 사용자 증가 추이 데이터가 없습니다.</div>`;
      }
    }

    const paymentChartElement = document.getElementById("paymentTrendChart");
    if (paymentChartElement) {
      const paymentChart =
        echarts.getInstanceByDom(paymentChartElement) ||
        echarts.init(paymentChartElement);
      if (salesAmountLoading) {
        paymentChart.showLoading();
      } else if (salesAmountError) {
        paymentChartElement.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 p-4">⚠️ 결제 금액 추이 로딩 실패: ${salesAmountError}</div>`;
      } else if (
        salesAmountData &&
        salesAmountData.dataPoints &&
        salesAmountData.dataPoints.length > 0
      ) {
        paymentChart.hideLoading();
        const paymentOption = {
          animation: false,
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: {
            type: "category" as const,
            data: salesAmountData.dataPoints.map((dp) => dp.date),
          },
          yAxis: {
            type: "value" as const,
            axisLabel: { formatter: "{value}원" },
          },
          series: [
            {
              name: salesAmountData.chartName || "결제 금액",
              type: "bar" as const,

              data: salesAmountData.dataPoints.map((dp) => dp.value),
              itemStyle: { color: "#3498DB" },
            },
          ],
        };
        paymentChart.setOption(paymentOption);
      } else {
        paymentChart.hideLoading();
        paymentChartElement.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 p-4">💰 결제 금액 추이 데이터가 없습니다.</div>`;
      }
    }

    const categoryChartElement = document.getElementById(
      "categoryDistributionChart"
    );
    if (categoryChartElement) {
      const categoryChart =
        echarts.getInstanceByDom(categoryChartElement) ||
        echarts.init(categoryChartElement);
      const categoryOption = {
        animation: false,
        tooltip: { trigger: "item" },
        legend: {
          orient: "vertical" as const,
          left: "left" as const,
          textStyle: { color: "#2C3E50" },
        },
        series: [
          {
            name: "강의 카테고리",
            type: "pie" as const,
            radius: "70%",
            data: [
              { value: 35, name: "요가" },
              { value: 25, name: "필라테스" },
              { value: 20, name: "웨이트 트레이닝" },
              { value: 15, name: "홈트레이닝" },
              { value: 5, name: "기타" },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            itemStyle: {
              color: function (params: any) {
                const colorList = [
                  "#2ECC71",
                  "#3498DB",
                  "#9B59B6",
                  "#F1C40F",
                  "#E74C3C",
                ];
                return colorList[params.dataIndex];
              },
            },
          },
        ],
      };
      categoryChart.setOption(categoryOption);
    }

    const reportChartElement = document.getElementById("reportTypeChart");
    if (reportChartElement) {
      const reportChart =
        echarts.getInstanceByDom(reportChartElement) ||
        echarts.init(reportChartElement);
      const reportOption = {
        animation: false,
        tooltip: { trigger: "item" },
        legend: {
          orient: "vertical" as const,
          left: "left" as const,
          textStyle: { color: "#2C3E50" },
        },
        series: [
          {
            name: "신고 유형",
            type: "pie" as const,
            radius: "70%",
            data: [
              { value: 40, name: "부적절한 콘텐츠" },
              { value: 25, name: "허위 정보" },
              { value: 20, name: "저작권 침해" },
              { value: 15, name: "기타" },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            itemStyle: {
              color: function (params: any) {
                const colorList = ["#E74C3C", "#F39C12", "#3498DB", "#95A5A6"];
                return colorList[params.dataIndex];
              },
            },
          },
        ],
      };
      reportChart.setOption(reportOption);
    }

    const handleResize = () => {
      if (userChartElement && echarts.getInstanceByDom(userChartElement))
        echarts.getInstanceByDom(userChartElement)?.resize();
      if (
        categoryChartElement &&
        echarts.getInstanceByDom(categoryChartElement)
      )
        echarts.getInstanceByDom(categoryChartElement)?.resize();
      if (paymentChartElement && echarts.getInstanceByDom(paymentChartElement))
        echarts.getInstanceByDom(paymentChartElement)?.resize();
      if (reportChartElement && echarts.getInstanceByDom(reportChartElement))
        echarts.getInstanceByDom(reportChartElement)?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (userChartElement && echarts.getInstanceByDom(userChartElement))
        echarts.getInstanceByDom(userChartElement)?.dispose();
      if (
        categoryChartElement &&
        echarts.getInstanceByDom(categoryChartElement)
      )
        echarts.getInstanceByDom(categoryChartElement)?.dispose();
      if (paymentChartElement && echarts.getInstanceByDom(paymentChartElement))
        echarts.getInstanceByDom(paymentChartElement)?.dispose();
      if (reportChartElement && echarts.getInstanceByDom(reportChartElement))
        echarts.getInstanceByDom(reportChartElement)?.dispose();
    };
  }, [
    userChartPeriod,
    userGrowthData,
    userGrowthLoading,
    userGrowthError,
    salesChartPeriod,
    salesAmountData,
    salesAmountLoading,
    salesAmountError,
  ]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metricsLoading && (
          <div className="col-span-full text-center p-4">
            📊 핵심 지표 로딩 중...
          </div>
        )}
        {metricsError && (
          <div className="col-span-full text-center p-4 text-red-500">
            ⚠️ 핵심 지표 로딩 에러: {metricsError}
          </div>
        )}

        {!metricsLoading && !metricsError && (
          <>
            {" "}
            {/* React Fragment 시작 */}
            {metrics.length > 0 ? (
              metrics.map((metricItem) => {
                const displayConfig = metricDisplayConfig[
                  metricItem.metricName
                ] || {
                  icon: "fa-solid fa-question-circle",
                  bgColor: "bg-gray-100",
                  textColor: "text-gray-500",
                  displayName: metricItem.metricName,
                };

                return (
                  <div
                    key={displayConfig.displayName}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {displayConfig.displayName}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {metricItem.currentValue.toLocaleString()}
                        </h3>
                        {metricItem.percentageChange !== null && (
                          <p
                            className={`text-xs ${metricItem.percentageChange >= 0 ? "text-[#2ECC71]" : "text-red-500"} mt-1`}
                          >
                            <i
                              className={`fas ${metricItem.percentageChange >= 0 ? "fa-arrow-up" : "fa-arrow-down"} mr-1`}
                            ></i>
                            <span>
                              {Math.abs(metricItem.percentageChange)}%{" "}
                              {metricItem.percentageChange >= 0
                                ? "증가"
                                : "감소"}
                            </span>
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-12 h-12 ${displayConfig.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <i
                          className={`${displayConfig.icon} ${displayConfig.textColor} text-xl`}
                        ></i>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center p-4">
                표시할 핵심 지표 데이터가 없습니다. (신고 건수 제외)
              </div>
            )}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">신고 건수</p>
                  <h3 className="text-2xl font-bold text-gray-800">24</h3>
                  <p className="text-xs text-[#E74C3C] mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    <span>5.1% 증가</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-flag text-red-500 text-xl"></i>
                </div>
              </div>
            </div>
          </> /* React Fragment 끝 */
        )}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">사용자 증가 추이</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setUserChartPeriod("daily")}
                className={`px-3 py-1 text-xs ${userChartPeriod === "daily" ? "bg-[#2ECC71] text-white" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button`}
              >
                일간
              </button>
              <button
                onClick={() => setUserChartPeriod("weekly")}
                className={`px-3 py-1 text-xs ${userChartPeriod === "weekly" ? "bg-[#2ECC71] text-white" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button`}
              >
                주간
              </button>
              <button
                onClick={() => setUserChartPeriod("monthly")}
                className={`px-3 py-1 text-xs ${userChartPeriod === "monthly" ? "bg-[#2ECC71] text-white" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button`}
              >
                월간
              </button>
            </div>
          </div>
          <div id="userGrowthChart" className="w-full h-64"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">강의 카테고리별 분포</h3>
            <button className="text-[#2ECC71] hover:text-[#27AE60] transition-colors duration-200 cursor-pointer">
              <i className="fas fa-download mr-1"></i>
              <span>엑셀 다운로드</span>
            </button>
          </div>
          <div id="categoryDistributionChart" className="w-full h-64"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">일별 결제 금액 추이</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSalesChartPeriod("daily")}
                className={`px-3 py-1 text-xs ${salesChartPeriod === "daily" ? "bg-[#2ECC71] text-white" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button`}
              >
                일간
              </button>
              <button
                onClick={() => setSalesChartPeriod("weekly")}
                className={`px-3 py-1 text-xs ${salesChartPeriod === "weekly" ? "bg-[#2ECC71] text-white" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button`}
              >
                주간
              </button>
              <button
                onClick={() => setSalesChartPeriod("monthly")}
                className={`px-3 py-1 text-xs ${salesChartPeriod === "monthly" ? "bg-[#2ECC71] text-white" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button`}
              >
                월간
              </button>
            </div>
          </div>
          <div id="paymentTrendChart" className="w-full h-64"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">신고 유형별 현황</h3>
            <button className="text-[#2ECC71] hover:text-[#27AE60] transition-colors duration-200 cursor-pointer">
              <i className="fas fa-sync-alt mr-1"></i>
              <span>새로고침</span>
            </button>
          </div>
          <div id="reportTypeChart" className="w-full h-64"></div>
        </div>
      </div>

      {isNoticeModalOpen && selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedNotice.title}
              </h3>
              <button
                onClick={closeNoticeModal}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <i className="fas fa-user mr-2"></i>
                  <span>{selectedNotice.author}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-calendar mr-2"></i>
                  <span>{selectedNotice.date}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-eye mr-2"></i>
                  <span>{selectedNotice.views.toLocaleString()} 회</span>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{selectedNotice.content}</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={closeNoticeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPageContent;
