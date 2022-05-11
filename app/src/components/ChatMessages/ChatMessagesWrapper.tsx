import React, { useEffect, useRef } from "react"
import { Spinner } from "reactstrap"
import styled from "styled-components"
import * as Colors from "../../constants/colors"
import { loadMessagesForRoom } from "../../redux/actions/actionCreator"
import { useAppDispatch } from "../../redux/hooks/useAppDispatch"
import { useAppSelector } from "../../redux/hooks/useAppSelector"

const StyledMessageContent = styled.div.attrs(
  (props: { isUserSender: boolean }) => props
)`
  font-size: 16px;
  color: ${(props) => (props.isUserSender ? Colors.ANATRACITE : "#f0f2f5")};
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 16px;
  width: fit-content;
  background: ${(props) =>
    props.isUserSender ? "#f0f2f5" : Colors.ANATRACITE};
`
const StyledMessagesWrapper = styled.div`
  overflow-y: scroll;
  padding: 20px 40px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  height: 85%;
`

const StyledSpinnerWrapper = styled.div`
  span {
    color: ${Colors.ANATRACITE};
  }
  height: 85%;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`
const StyledMessageSender = styled.div.attrs(
  (props: { isUserSender: boolean }) => props
)`
  font-size: 14px;
  color: ${Colors.ANATRACITE};
  text-align: ${(props) => (props.isUserSender ? "right" : "left")};
`
const StyledSingleMessage = styled.div.attrs(
  (props: { isUserSender: boolean }) => props
)`
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isUserSender ? "end" : "start")};
`

interface ChatMessagesProps {
  chatHistory: any[]
  chatRef: React.RefObject<HTMLDivElement>
  currentActiveRoom: any
}

const ChatMessagesWrapper = ({
  chatHistory,
  chatRef,
  currentActiveRoom
}: ChatMessagesProps) => {
  const dispatch = useAppDispatch()
  const sortedHistory = chatHistory.sort((a, b) => a.timestamp - b.timestamp)
  const chatHistoryRef = useRef(sortedHistory)
  const loadingMessages = useAppSelector((state) => state.ChatReducer.loading)
  const userHandle: string = useAppSelector(
    (state) => state.ChatReducer.userHandle
  )

  const handleScroll = () => {
    // @ts-ignore
    if (chatRef.current.scrollTop === 0) {
      fetchNewMessages()
    }
  }

  const fetchNewMessages = () => {
    const lastMessage = chatHistoryRef.current[0]

    dispatch(
      loadMessagesForRoom(
        currentActiveRoom.id,
        new Date(lastMessage.timestamp).getTime(),
        false,
        {
          onSuccess: (res: any) => {
            chatHistoryRef.current = res.concat(sortedHistory)
          }
        }
      )
    )
  }

  useEffect(() => {
    chatRef.current?.addEventListener("scroll", handleScroll)
    return () => {
      chatRef.current?.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return loadingMessages ? (
    <StyledSpinnerWrapper>
      <>
        <Spinner
          animation="grow"
          role="status"
          className="spinner-grow text-secondary"
        />
        <span> Loading messages </span>
      </>
    </StyledSpinnerWrapper>
  ) : (
    <StyledMessagesWrapper ref={chatRef}>
      {sortedHistory.length > 0 &&
        sortedHistory.map((messageObj) => (
          <StyledSingleMessage isUserSender={userHandle === messageObj.sender}>
            <StyledMessageSender
              isUserSender={userHandle === messageObj.sender}
            >
              {messageObj.sender}
            </StyledMessageSender>
            <StyledMessageContent
              key={messageObj.uuid}
              isUserSender={userHandle === messageObj.sender}
            >
              {messageObj.message_content}
            </StyledMessageContent>
          </StyledSingleMessage>
        ))}
    </StyledMessagesWrapper>
  )
}

export default ChatMessagesWrapper
