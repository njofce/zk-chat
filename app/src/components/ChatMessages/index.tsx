import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clientUrl, roomTypes } from "../../constants/constants";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { addActiveChatRoom, deleteMessagesForRoom } from "../../redux/actions/actionCreator";
import InviteModal from "../Modals/inviteModal";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import Input from "../Input";
import ReactTooltip from "react-tooltip";
import ChatMessagesWrapper from "./ChatMessagesWrapper"
import { delete_messages_for_room } from "rln-client-lib";


const StyledChatContainer = styled.div`
  background: white;
  height: 100%;
  border-radius: 18px;
  box-shadow: 0px 8px 14px 0px #a0a0a0;
  padding: 20px 40px;
`

const StyledChatDetailsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  svg {
    cursor: pointer;
    path {
      fill: ${Colors.ANATRACITE};
    }
  }
`
const StyledChatRoomsTitle = styled.p`
  color: ${Colors.ANATRACITE};
  font-weight: 600;
  font-size: 24px;
`

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
`

const StyledIconWrapper = styled.div`
  margin: 0 30px;
`
const StyledChatCommandsWrapper = styled.div`
  display: flex;
  align-items: center;
`

type ChatMessagesProps = {
  currentActiveRoom: any
}

const ChatMessages = ({ currentActiveRoom }: ChatMessagesProps) => {
  const [toggleInviteModal, setToggleInviteModal] = useState(false);
  const [isPublicRoomInviteCopied, setIsPublicRoomInviteCopied] = useState(
    false
  );
  //@ts-ignore
  const chatHistoryByRoom: any[] = useAppSelector(
    (state) => state.ChatReducer.chatHistory[currentActiveRoom.id]
  )
  const stayOnBottom: boolean = useAppSelector(
    (state) => state.ChatReducer.stayOnBottom
  )
  const chatRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  const scrollToBottom = () => {
    if (chatRef.current) {
      //Scroll to bottom
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (stayOnBottom) scrollToBottom()
  }, [chatHistoryByRoom, stayOnBottom])

  const handleActiveChatClosing = () => {
    dispatch(addActiveChatRoom(undefined))
  }

  const handleGenerateInvitePublicRoomLink = () => {
    const publicRoomInviteLink = `${clientUrl}/public/${currentActiveRoom.id}`
    navigator.clipboard.writeText(publicRoomInviteLink).then(() => {
      setIsPublicRoomInviteCopied(true)
      setTimeout(() => setIsPublicRoomInviteCopied(false), 4000)
    })
  }

  const handleMessagesDeleting = () => {
    delete_messages_for_room(currentActiveRoom.id).then(() =>
      dispatch(deleteMessagesForRoom(currentActiveRoom.id))
    )
  }

  return (
    <StyledChatContainer className="col">
      <StyledChatDetailsWrapper>
        <StyledChatRoomsTitle>{currentActiveRoom.name}</StyledChatRoomsTitle>
        <StyledChatCommandsWrapper>
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
          <StyledIconWrapper>
            <FontAwesomeIcon
              icon={faTrash}
              onClick={handleMessagesDeleting}
              data-tip
              data-for="DeleteContact"
            />
            <ReactTooltip
              event="mouseenter"
              eventOff="click mouseleave"
              id="DeleteContact"
              backgroundColor={Colors.ANATRACITE}
            >
              Delete Message History
            </ReactTooltip>
          </StyledIconWrapper>
          <FontAwesomeIcon icon={faTimes} onClick={handleActiveChatClosing} />
        </StyledChatCommandsWrapper>
      </StyledChatDetailsWrapper>{" "}
      <ChatMessagesWrapper
        chatHistory={chatHistoryByRoom}
        chatRef={chatRef}
        currentActiveRoom={currentActiveRoom}
      />
      <Input currentActiveRoom={currentActiveRoom} />
      <InviteModal
        toggleInviteModal={toggleInviteModal}
        setToggleInviteModal={setToggleInviteModal}
      />
    </StyledChatContainer>
  )
}

export default ChatMessages
