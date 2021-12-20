import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { join_public_room } from "rln-client-lib";
import styled from "styled-components";
import * as Colors from "../../constants/colors";

const StyledButton = styled.button`
  background: ${Colors.BERRY_PINK};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  color: white;
  &:hover {
    transition: 0.15s;
    box-shadow: 0px 0px 15px 0px ${Colors.BERRY_PINK};
  }
  width: 180px;
`;

const StyledInvitedScreenWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const StyledNotificationWrapper = styled.div`
  color: ${Colors.PASTEL_RED};
  font-size: 24px;
  margin: 20px 0;
`;

const successMessage = "Your new public room has been successfully added."

const PublicRoomInvitedScreen = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [notificationMessage,setNotificationMessage] = useState("")

  const handlePublicRoomInvite=async()=>{
    try { 
      //@ts-ignore
      await join_public_room(params.roomId).then(() => setNotificationMessage(successMessage))
    } catch (error) {
      setNotificationMessage(error as string)
    }
  }

  return (
    <StyledInvitedScreenWrapper>
      <div>
        {notificationMessage ?
          <>
           <StyledNotificationWrapper>
              {notificationMessage}
            </StyledNotificationWrapper>
            <StyledButton onClick={() => navigate("/dashboard")}>
              Go to Rooms
            </StyledButton>
          </> :
          <>
            <StyledNotificationWrapper>
              Would you like to join room with id: {params.roomId} ?
            </StyledNotificationWrapper>
            <StyledButton onClick={handlePublicRoomInvite}> Join </StyledButton>
          </>
        }
      </div>
    </StyledInvitedScreenWrapper>
  );
};

export default PublicRoomInvitedScreen;
