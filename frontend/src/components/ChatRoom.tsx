"use client";

import { useEffect } from "react";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

type Props = { roomId: number }; // `number`로 타입 변경

const ChatRoom = ({ roomId }: Props) => {
  useEffect(() => {
    console.log("받은 roomId:", roomId); // `roomId`가 `number`로 제대로 넘어가는지 확인

    const socket = new SockJS("http://localhost:8090/api/chat");
    const stompClient: CompatClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe(`/subscribe/enter/room/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        console.log("입장 메시지:", data);
      });

      stompClient.send(
        `/publish/chat/room/enter/${roomId}`,
        {},
        JSON.stringify({
          writerName: "홍길동",
          receiverName: "아무개",
        })
      );
    });

    return () => {
      stompClient.disconnect(() => {
        console.log("연결 해제됨");
      });
    };
  }, [roomId]);

  return <div>채팅방 #{roomId}</div>;
};

export default ChatRoom;
