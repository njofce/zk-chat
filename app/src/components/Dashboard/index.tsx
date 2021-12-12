import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ChatRooms from "../ChatRooms";
import ChatMessages from "../ChatMessages";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

const StyledDashboardWrapper = styled.div`
  height: 100vh;
  padding: 1rem;
`;

const Dashboard = () => {
  const [toggleChatMessages, setToggleChatMessages] = useState(false);
  const [chatRoomDetails, setChatRoomDetails] = useState({});
  const currentActiveRoom: any = useAppSelector(
    state => state.TestReducer.currentActiveRoom
  );
  const rooms: any = useAppSelector(state => state.TestReducer.rooms);

  useEffect(() => {
    if (currentActiveRoom.roomName) setToggleChatMessages(true);
  }, [currentActiveRoom, rooms]);

  return (
    <StyledDashboardWrapper className="row">
      <ChatRooms
        setToggleChatMessages={setToggleChatMessages}
        setChatRoomDetails={setChatRoomDetails}
      />
      {/* <RoomHandlingButtons /> */}
      {toggleChatMessages && (
        <ChatMessages
          chatRoomDetails={chatRoomDetails}
          setToggleChatMessages={setToggleChatMessages}
          currentActiveRoom={currentActiveRoom}
        />
      )}
    </StyledDashboardWrapper>
  );
};

export default Dashboard;
