import React from "react"
import PublicRoomInvitedScreen from "../PublicRoomInvitedScreen"
import RegisterOrRecover from "../RegisterOrRecover"
import Dashboard from "../Dashboard"
import SyncSpinner from "../Spinner"
import { Routes, Route, Navigate } from "react-router-dom"
import { useLocation, useNavigate } from "react-router"
import { get_rooms, init, receive_message } from "rln-client-lib"
import { useEffect } from "react"
import { useAppDispatch } from "../../redux/hooks/useAppDispatch"
import {
  addMessageToRoomAction,
  getRoomsAction,
  loadMessagesForRooms,
  runSyncMessageHistory
} from "../../redux/actions/actionCreator"
import { roomTypes, serverUrl, socketUrl } from "../../constants/constants"
import { ToastContainer } from "react-toastify"

import 'react-toastify/dist/ReactToastify.css';
import { generateProof } from "../../util/util";
import "react-toastify/dist/ReactToastify.css"
import { IMessage } from "rln-client-lib/dist/src/chat/interfaces"
import { IRooms } from "rln-client-lib/dist/src/profile/interfaces"
import { useAppSelector } from "../../redux/hooks/useAppSelector"

const AppWrapper = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()

  const isChatHistorySyncing = useAppSelector(
    (state) => state.ChatReducer.chatHistorySyncing
  )

  useEffect(() => {
    initializeApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeApp = async () => {
    try {
      await init({
        serverUrl: serverUrl,
        socketUrl: socketUrl
      }, generateProof).then(() => {
        if (!location.pathname.includes(roomTypes.public))
          navigate("/dashboard")
        dispatch(getRoomsAction())
        dispatch(
          runSyncMessageHistory({
            onSuccess: () => {
              loadMessagesFromDb()
            }
          })
        )
      })
    } catch (error) {
      navigate("/r-procedure")
    }
  }

  const loadMessagesFromDb = async () => {
    const allRooms: IRooms = await get_rooms()
    const roomIds: string[] = [
      ...allRooms.direct.map((d) => d.id),
      ...allRooms.private.map((d) => d.id),
      ...allRooms.public.map((d) => d.id)
    ]

    const nowTimestamp: number = new Date().getTime()
    dispatch(loadMessagesForRooms(roomIds, nowTimestamp))

    await receive_message(receiveMessageCallback)
  }

  const receiveMessageCallback = (message: IMessage, roomId: string) => {
    dispatch(addMessageToRoomAction(message, roomId))
  }

  return (
    <div className="w-100 vh-100 container-fluid">
      {isChatHistorySyncing ? (
        <SyncSpinner />
      ) : (
        <>
          {" "}
          <Routes>
            <Route path="/r-procedure" element={<RegisterOrRecover />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/public/:roomId"
              element={<PublicRoomInvitedScreen />}
            />
            <Route path="/" element={<Navigate replace to="/r-procedure" />} />
          </Routes>
          <ToastContainer />
        </>
      )}
    </div>
  )
}

export default AppWrapper
