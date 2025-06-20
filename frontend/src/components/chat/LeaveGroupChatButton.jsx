import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { Button } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const LeaveGroupChatButton = ({ roomId, username, stompClient }) => {
  const navigate = useNavigate();

  const handleLeaveChat = () => {
    // Show confirmation alert
    const confirmed = window.confirm("이 방을 정말 나가시겠습니까?");
    
    if (confirmed) {
      const leaveMessage = {
        writerName: username,
      };

      // Send leave message to the server
      stompClient.publish({
        destination: `/app/chat/group/room/leave/${roomId}`,
        body: JSON.stringify(leaveMessage),
      });

      // Navigate back to chat list or home page
      navigate('/chat/list');
    }
  };

  return (
    <Button 
      variant="outlined" 
      color="error" 
      onClick={handleLeaveChat}
      startIcon={<ExitToAppIcon />}
    >
      나가기
    </Button>
  );
};

export default LeaveGroupChatButton;