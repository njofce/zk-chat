import React, { useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import RecoverModal from "../Modals/recoverModal";
import { init, receive_message } from "rln-client-lib";
import { useDispatch } from "react-redux";
import { addMessageToRoomAction, getChatHistoryAction, getRoomsAction } from "../../redux/actions/actionCreator";
import {
  identityCommitment,
  identitySecret,
  serverUrl,
  socketUrl
} from "../../constants/constants";

const StyledRegisterWrapper = styled.div`
  background: ${Colors.ANATRACITE};
  height: 100%;
  display: flex;
  align-items: center;
`;

const StyledButtonsContainer = styled.div`
  margin: 0 auto;
  min-width: 400px;
  border-radius: 27px;
  display: flex;
  flex-direction: column;
`;

const StyledRButton = styled.button`
  background: ${props => props.color};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  margin: 8px;
  color: ${Colors.ANATRACITE};
  &:hover {
    transition: 0.15s;
    box-shadow: 0px 0px 15px 0px ${props => props.color};
  }
`;

const RegisterOrRecover = () => {
  const [toggleRecoverModal, setToggleRecoverModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegisterClick = () => {
    initializeApp();
  };

  const initializeApp = async () => {
    try {
      await init(
        {
          serverUrl,
          socketUrl
        },
        identityCommitment,
        identitySecret
      ).then(() => {
        navigate("/dashboard");
        dispatch(getRoomsAction());
        dispatch(getChatHistoryAction())
      })
      .then(async() => {
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
    <StyledRegisterWrapper>
      <StyledButtonsContainer>
        <StyledRButton color={Colors.DARK_YELLOW} onClick={handleRegisterClick}>
          {" "}
          Register{" "}
        </StyledRButton>
        <StyledRButton
          color={Colors.PASTEL_RED}
          onClick={() => setToggleRecoverModal(true)}
        >
          {" "}
          Recover{" "}
        </StyledRButton>
        <RecoverModal
          toggleRecoverModal={toggleRecoverModal}
          setToggleRecoverModal={setToggleRecoverModal}
        />
      </StyledButtonsContainer>
    </StyledRegisterWrapper>
  );
};

export default RegisterOrRecover;
