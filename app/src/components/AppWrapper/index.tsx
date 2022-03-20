import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router";
import RegisterOrRecover from "../RegisterOrRecover";
import Dashboard from "../Dashboard";
import { init, receive_message } from "rln-client-lib";
import { useEffect } from "react";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import {
  addMessageToRoomAction,
  getChatHistoryAction,
  getRoomsAction
} from "../../redux/actions/actionCreator";
import PublicRoomInvitedScreen from "../PublicRoomInvitedScreen";
import { roomTypes, serverUrl, socketUrl } from "../../constants/constants";
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const AppWrapper = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeApp = async () => {
    try {
      await init({
        serverUrl: serverUrl,
        socketUrl: socketUrl
      })
        .then(() => {
          if (!location.pathname.includes(roomTypes.public))
            navigate("/dashboard");
          dispatch(getRoomsAction());
          dispatch(getChatHistoryAction());
        })
        .then(async () => {
          await receive_message(receiveMessageCallback);
        });
    } catch (error) {
      navigate("/r-procedure");
    }
  };

  const receiveMessageCallback = (message: any, roomId: string) => {
    dispatch(addMessageToRoomAction(message, roomId));
  };

  return (
    <div className="w-100 vh-100 container-fluid">
      <Routes>
        <Route path="/r-procedure" element={<RegisterOrRecover />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/public/:roomId" element={<PublicRoomInvitedScreen />} />
        <Route path="/" element={<Navigate replace to="/r-procedure" />} />
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default AppWrapper;
