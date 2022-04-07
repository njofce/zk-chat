import React from "react"
import styled from "styled-components"
import ChatRooms from "../ChatRooms"
import ChatMessages from "../ChatMessages"
import { useAppSelector } from "../../redux/hooks/useAppSelector"
import SyncSpinner from "../Spinner"

const StyledDashboardWrapper = styled.div`
  height: 100vh;
  padding: 1rem;
`

const Dashboard = () => {
  const currentActiveRoom: any = useAppSelector(
    (state) => state.ChatReducer.currentActiveRoom
  )
  const isChatHistorySyncing = useAppSelector(
    (state) => state.ChatReducer.chatHistorySyncing
  )

  return isChatHistorySyncing ? (
    <SyncSpinner />
  ) : (
    <StyledDashboardWrapper className="row">
      <ChatRooms />
      {currentActiveRoom && (
        <ChatMessages currentActiveRoom={currentActiveRoom} />
      )}
    </StyledDashboardWrapper>
  )
}

export default Dashboard
