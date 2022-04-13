import React, { useEffect, useRef } from "react"
import { Spinner } from "reactstrap"
import styled from "styled-components"
import * as Colors from "../../constants/colors"
import { loadMessagesForRoom } from "../../redux/actions/actionCreator"
import { useAppDispatch } from "../../redux/hooks/useAppDispatch"
import { useAppSelector } from "../../redux/hooks/useAppSelector"

const StyledSingleMessage = styled.div`
  font-size: 16px;
  color: black;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 16px;
  width: fit-content;
  text-align: left;
`
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
        />{" "}
        <span> Loading messages </span>
      </>
    </StyledSpinnerWrapper>
  ) : (
    <StyledMessagesWrapper ref={chatRef}>
      {sortedHistory.length > 0 &&
        sortedHistory.map((messageObj) => (
          <StyledSingleMessage key={messageObj.uuid}>
            {messageObj.message_content}
          </StyledSingleMessage>
        ))}
    </StyledMessagesWrapper>
  )
}

export default ChatMessagesWrapper
