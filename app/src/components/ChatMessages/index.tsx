import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { roomTypes } from "../../constants/constants";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { addActiveChatRoom } from "../../redux/actions/actionCreator";
import InviteModal from "../Modals/inviteModal";

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
const StyledInput = styled.input`
  border: 1px solid #f0f2f5;
  border-radius: 20px;
  width: 100%;
  position: relative;
  padding: 8px 12px;
  &:focus,
  &:active {
    outline: none;
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
const StyledChatFooterWrapper = styled.div`
  display: flex;
  svg {
    position: relative;
    top: 8px;
    left: 5px;
    cursor: pointer;
    path {
      fill: ${Colors.ANATRACITE};
    }
  }
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
  width: 130px;
`;

type ChatMessagesProps = {
  chatRoomDetails: any;
  setToggleChatMessages: (shouldToggle: boolean) => void;
  currentActiveRoom: any;
};

type ChatMessageType = {
  id?: number;
  text: string;
};

const hardcodedMessages: Array<ChatMessageType> = [
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim  ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut  aliquip ex ea commodo consequat."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. "
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    text: "Lorem ipsum dolor sit amet."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor."
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur."
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua.  "
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim  ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut  aliquip ex ea commodo consequat."
  },
  { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit" },
  { text: "Lorem ipsum dolor sit amet" },
  {
    text: "Lorem ipsum dolor sit amet."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor."
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur."
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua.  "
  },
  {
    text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim  ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut  aliquip ex ea commodo consequat."
  },
  { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit" },
  { text: "Lorem ipsum dolor sit amet" }
];

const ChatMessages = ({
  chatRoomDetails,
  setToggleChatMessages,
  currentActiveRoom
}: ChatMessagesProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [toggleInviteModal, setToggleInviteModal] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const scrollToBottom = () => {
    if (chatRef.current) {
      //Scroll to bottom
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (chatRoomDetails) {
      //fetch the latest messages and store them in local state
    }
    //move this into the conditional when BE data is ready
    setChatMessages(hardcodedMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleMessageSubmit = () => {
    if (currentInputValue) {
      const newMessages = [...chatMessages, { text: currentInputValue }];
      setChatMessages(newMessages);
      setCurrentInputValue("");
    }
  };

  const handleActiveChatClosing = () => {
    dispatch(addActiveChatRoom("", { name: "" }));
    setToggleChatMessages(false);
  };

  return (
    <StyledChatContainer className="col">
      <StyledChatDetailsWrapper>
        <StyledChatRoomsTitle>
          {" "}
          {currentActiveRoom.roomName ? currentActiveRoom.roomName : "Room 1"}
        </StyledChatRoomsTitle>{" "}
        <div>
          {currentActiveRoom.roomType === roomTypes.private && (
            <StyledButton onClick={() => setToggleInviteModal(true)}>
              {" "}
              Invite{" "}
            </StyledButton>
          )}
          <FontAwesomeIcon icon={faTimes} onClick={handleActiveChatClosing} />
        </div>
      </StyledChatDetailsWrapper>{" "}
      <StyledMessagesWrapper ref={chatRef}>
        {chatMessages.length > 0 &&
          chatMessages.map(message => (
            <StyledSingleMessage>{message.text}</StyledSingleMessage>
          ))}
      </StyledMessagesWrapper>
      <StyledChatFooterWrapper>
        <StyledInput
          placeholder={"Write down your message..."}
          value={currentInputValue}
          onChange={e => setCurrentInputValue(e.target.value)}
        />
        <div>
          {" "}
          <FontAwesomeIcon
            icon={faPaperPlane}
            onClick={handleMessageSubmit}
          />{" "}
        </div>
      </StyledChatFooterWrapper>
      <InviteModal
        toggleInviteModal={toggleInviteModal}
        setToggleInviteModal={setToggleInviteModal}
      />
    </StyledChatContainer>
  );
};

export default ChatMessages;
