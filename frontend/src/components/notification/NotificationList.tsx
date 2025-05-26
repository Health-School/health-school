import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Notification } from "@/components/notification/Notification";

interface NotificationListProps {
  lectureId: string | number;
  onSelect: (notification: Notification) => void;
}

const PAGE_SIZE = 10;

const NotificationList: React.FC<NotificationListProps> = ({
  lectureId,
  onSelect,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 데이터 패칭
  useEffect(() => {
    let ignore = false;
    const fetchNotifications = async () => {
      if (loading || !hasMore) return;
      console.log("IntersectionObserver 등록");

      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureId}`,
        { credentials: "include" }
      );
      const json = await res.json();
      const newData: Notification[] = json.data || [];
      if (!ignore) {
        setNotifications((prev) =>
          page === 0 ? newData : [...prev, ...newData]
        );
        setHasMore(newData.length === PAGE_SIZE);
        setLoading(false);
      }
    };
    fetchNotifications();
    return () => {
      ignore = true;
    };
  }, [page, lectureId]);

  // IntersectionObserver 등록 (내부 스크롤 기준)
  useLayoutEffect(() => {
    console.log("loader:", loader.current, "scrollRef:", scrollRef.current);
    if (!hasMore || loading) return;
    if (!loader.current || !scrollRef.current) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("loader is visible, setPage 호출");
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.1,
        root: scrollRef.current,
      }
    );
    observer.observe(loader.current);

    return () => {
      if (loader.current) observer.unobserve(loader.current);
      observer.disconnect();
    };
  }, [hasMore, loading, notifications.length]);

  // lectureId가 바뀌면 초기화
  useEffect(() => {
    setNotifications([]);
    setPage(0);
    setHasMore(true);
    setLoading(false);
  }, [lectureId]);

  return (
    <div className="max-h-[600px] overflow-y-auto" ref={scrollRef}>
      <ul>
        {notifications.map((n) => (
          <li
            key={n.id}
            className="p-4 border-b cursor-pointer hover:bg-gray-50"
            onClick={() => onSelect(n)}
          >
            <div className="font-semibold">{n.title}</div>
            <div className="text-xs text-gray-400">
              {n.lectureName} · {new Date(n.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
      <div
        ref={loader}
        className="h-8 flex items-center justify-center"
        key="loader"
      >
        {loading && <span className="text-gray-400">불러오는 중...</span>}
        {!hasMore && <span className="text-gray-400">마지막 공지입니다.</span>}
      </div>
    </div>
  );
};

export default NotificationList;
