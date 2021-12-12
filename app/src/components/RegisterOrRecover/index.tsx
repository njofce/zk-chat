import React, { useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import RecoverModal from "../Modals/recoverModal";
import {init} from 'rln-client-lib';

const StyledRegisterWrapper = styled.div`
  background: ${Colors.ANATRACITE};
  height: 100%;
  display: flex;
  align-items: center;
`;

const StyledButtonsContainer = styled.div`
  margin: 0 auto;
  min-width: 400px;
  // box-shadow: 0px 8px 14px 0px gray;
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
  const [toggleRecoverModal, setToggleRecoverModal] = useState(false)
  const navigate = useNavigate();

  init({
    serverUrl: "http://localhost:3000",
    socketUrl: "ws://localhost:3001"
  })

  return (
    <StyledRegisterWrapper>
      <StyledButtonsContainer>
        <StyledRButton
          color={Colors.DARK_YELLOW}
          onClick={() => navigate("/dashboard")}
        >
          {" "}
          Register{" "}
        </StyledRButton>
        <StyledRButton color={Colors.PASTEL_RED} onClick={()=>setToggleRecoverModal(true)}> Recover </StyledRButton>
        <RecoverModal toggleRecoverModal={toggleRecoverModal} setToggleRecoverModal={setToggleRecoverModal}/> 
      </StyledButtonsContainer>
    </StyledRegisterWrapper>
  );
};

export default RegisterOrRecover;
