import React, { useEffect } from "react"
import styled from "styled-components"
import * as Colors from "../../constants/colors"
import {
  addActiveChatRoom,
  getRoomsAction,
  getUserHandle,
  Room
} from "../../redux/actions/actionCreator"
import { useAppDispatch } from "../../redux/hooks/useAppDispatch"
import { useAppSelector } from "../../redux/hooks/useAppSelector"
import RoomHandlingButtons from "../RoomHandlingButtons"

const StyledChatRoomWrapper = styled.div`
  background: white;
  height: 100vh;
  box-shadow: 0px 8px 14px 0px #a0a0a0;
  border-radius: 18px;
  padding: 20px 40px 0 40px;
  margin-right: 16px;
`
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
`
export const StyledChatRoomsTitle = styled.p`
  color: ${Colors.DARK_YELLOW};
  font-weight: 600;
  font-size: 24px;
  text-transform: capitalize;
`
const StyledChatRoomsWrapper = styled.div`
  overflow-y: scroll;
  padding: 20px 40px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  height: 85%;
`
const StyledBanner = styled.div`
  color: ${Colors.BERRY_PINK};
  font-weight: 600;
  font-size: 20px;
  padding: 10px;
`

const ChatRooms = () => {
  const rooms: any = useAppSelector((state) => state.ChatReducer.rooms)
  const userHandle: string = useAppSelector(
    (state) => state.ChatReducer.userHandle
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getRoomsAction())
    dispatch(getUserHandle())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleChatRoomCellClick = (room: Room) => {
    dispatch(addActiveChatRoom(room))
  }
  return (
    <>
      <StyledChatRoomWrapper className="col-sm-12 col-md-12 col-lg-4 col-xl-4 h-100">
        <StyledChatRoomsTitle> Chat rooms </StyledChatRoomsTitle>
        <StyledChatRoomsWrapper>
          {Object.keys(rooms).map((key) => (
            <React.Fragment key={key}>
              <StyledChatRoomsTitle>{`${key}: ${rooms[key].length}`}</StyledChatRoomsTitle>
              {rooms[key].map((room: Room) => (
                <StyledChatRoomCell
                  key={room.id}
                  onClick={() => handleChatRoomCellClick(room)}
                >
                  {room.name}
                </StyledChatRoomCell>
              ))}
            </React.Fragment>
          ))}
        </StyledChatRoomsWrapper>
        <RoomHandlingButtons />
        <StyledBanner>Welcome {userHandle} !</StyledBanner>
      </StyledChatRoomWrapper>
    </>
  )
}

export default ChatRooms
