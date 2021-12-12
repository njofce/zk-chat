import styled from "styled-components";
import * as Colors from "../../constants/colors"; 
import RoomHandlingButtons from "../RoomHandlingButtons";

const StyledChatRoomWrapper = styled.div`
  background: white;
  height: 100vh;
  box-shadow: 0px 8px 14px 0px #a0a0a0;
  border-radius: 18px;
  padding: 20px 40px;
  margin-right: 16px;
`;
const StyledChatRoomCell = styled.div`
  background: ${Colors.DARK_YELLOW};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  margin-bottom: 8px;
  color: ${Colors.ANATRACITE};
  &:hover {
    cursor: pointer;
    transition: 0.15s;
    box-shadow: 0px 0px 15px 0px ${Colors.DARK_YELLOW};
  }
`;
const StyledChatRoomsTitle = styled.p`
  color: ${Colors.DARK_YELLOW};
  font-weight: 600;
  font-size: 24px; 
`;
const StyledChatRoomsWrapper = styled.div`
  overflow-y: scroll;
  padding: 20px 40px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  height: 85%;
`;

type ChatRoomProps = {
  setToggleChatMessages: (shouldToggle: boolean) => void;
  setChatRoomDetails: (chatDetails: any) => void;
};

const ChatRooms = ({
  setToggleChatMessages,
  setChatRoomDetails
}: ChatRoomProps) => {
  // const dispatch = useAppDispatch();
  const handleChatRoomCellClick = () => {
    // send the neccessary data for fetching the chat messages and open the chat
    setToggleChatMessages(true);
    // dispatch(addActiveChatRoom() )
    setChatRoomDetails({});
  };
  //export, generate public key, join

  return (
    <>
      <StyledChatRoomWrapper className="col-sm-12 col-md-12 col-lg-4 col-xl-4 h-100">
        <StyledChatRoomsTitle> Chat rooms </StyledChatRoomsTitle>
        <StyledChatRoomsWrapper>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 1
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 2
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 3
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 4
          </StyledChatRoomCell>
          {/* <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 1
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 2
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 3
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 4
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 1
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 2
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 3
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 4
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 1
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 2
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 3
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 4
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 1
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 2
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 3
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 4
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 1
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 2
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 3
          </StyledChatRoomCell>
          <StyledChatRoomCell onClick={handleChatRoomCellClick}>
            {" "}
            Room 4
          </StyledChatRoomCell> */}
        </StyledChatRoomsWrapper>
        <RoomHandlingButtons />
      </StyledChatRoomWrapper>
    </>
  );
};

export default ChatRooms;
