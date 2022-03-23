import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clientUrl, roomTypes } from "../../constants/constants";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { addActiveChatRoom } from "../../redux/actions/actionCreator";
import InviteModal from "../Modals/inviteModal";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import Input from "../Input";
import ReactTooltip from "react-tooltip";

const StyledChatContainer = styled.div`
  background: white;
  height: 100%;
  border-radius: 18px;
  box-shadow: 0px 8px 14px 0px #a0a0a0;
  padding: 20px 40px;
`;
const StyledSingleMessage = styled.div`
  font-size: 16px;
  color: black;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 16px;
  width: fit-content;
  text-align: left;
`;
const StyledMessagesWrapper = styled.div`
  overflow-y: scroll;
  padding: 20px 40px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  height: 85%;
  div:nth-child(odd) {
    background: ${Colors.ANATRACITE};
    color: white;
  }
  div:nth-child(even) {
    background: #f0f2f5;
  }
`;

const StyledChatDetailsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  svg {
    cursor: pointer;
    path {
      fill: ${Colors.ANATRACITE};
    }
  }
`;
const StyledChatRoomsTitle = styled.p`
  color: ${Colors.ANATRACITE};
  font-weight: 600;
  font-size: 24px;
`;

const StyledButton = styled.button`
  background: ${Colors.BERRY_PINK};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  margin-right: 30px;
  color: white;
  &:hover {
    transition: 0.15s;
    box-shadow: 0px 0px 15px 0px ${Colors.BERRY_PINK};
  }
  width: 180px;
`;

type ChatMessagesProps = {
  currentActiveRoom: any;
};

const ChatMessages = ({ currentActiveRoom }: ChatMessagesProps) => {
  const [toggleInviteModal, setToggleInviteModal] = useState(false);
  const [isPublicRoomInviteCopied, setIsPublicRoomInviteCopied] = useState(
    false
  );
  //@ts-ignore
  const chatHistoryByRoom: any[] = useAppSelector(
    state => state.ChatReducer.chatHistory[currentActiveRoom.id]
  );
  const chatRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const scrollToBottom = () => {
    if (chatRef.current) {
      //Scroll to bottom
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistoryByRoom]);

  const handleActiveChatClosing = () => {
    dispatch(addActiveChatRoom(undefined));
  };

  const handleGenerateInvitePublicRoomLink = () => {
    const publicRoomInviteLink = `${clientUrl}/public/${currentActiveRoom.id}`;    
    navigator.clipboard.writeText(publicRoomInviteLink).then(() => {
      setIsPublicRoomInviteCopied(true)
      setTimeout(() => setIsPublicRoomInviteCopied(false), 4000);
    });
  };

  return (
    <StyledChatContainer className="col">
      <StyledChatDetailsWrapper>
        <StyledChatRoomsTitle>{currentActiveRoom.name}</StyledChatRoomsTitle>
        <div>
          {currentActiveRoom.type.toLowerCase() === roomTypes.private && (
            <>
              <StyledButton onClick={() => setToggleInviteModal(true)}>
                {" "}
                Invite{" "}
              </StyledButton>
            </>
          )}
          {currentActiveRoom.type.toLowerCase() === roomTypes.public && (
            <>
              <StyledButton
                onClick={handleGenerateInvitePublicRoomLink}
                data-tip
                data-for="CopyInviteLinkButton"
              >
                {" "}
                Generate invite link{" "}
              </StyledButton>
              <ReactTooltip
                event="mouseenter"
                eventOff="mouseleave"
                id="CopyInviteLinkButton"
                backgroundColor={Colors.ANATRACITE}
              >
                {" "}
                {isPublicRoomInviteCopied
                  ? "Your invite link is ready to be shared!"
                  : "Generate and copy public room invite link"}{" "}
              </ReactTooltip>
            </>
          )}
          <FontAwesomeIcon icon={faTimes} onClick={handleActiveChatClosing} />
        </div>
      </StyledChatDetailsWrapper>{" "}
      <StyledMessagesWrapper ref={chatRef}>
        {chatHistoryByRoom?.length > 0 &&
          chatHistoryByRoom.map(messageObj => (
            <StyledSingleMessage key={messageObj.uuid}>
              {messageObj.message_content}
            </StyledSingleMessage>
          ))}
      </StyledMessagesWrapper>
      <Input currentActiveRoom={currentActiveRoom} />
      <InviteModal
        toggleInviteModal={toggleInviteModal}
        setToggleInviteModal={setToggleInviteModal}
      />
    </StyledChatContainer>
  );
};

export default ChatMessages;
