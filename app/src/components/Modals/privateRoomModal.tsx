import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import styled from "styled-components";
import * as Colors from "../../constants/colors";

const StyledTextarea = styled.textarea`
  border: 1px solid #f0f2f5;
  border-radius: 20px;
  width: 100%;
  position: relative;
  margin-bottom: 10px;
  padding: 8px 12px;
  min-height: 40px;
  &:focus,
  &:active {
    outline: none;
  }
`;

const StyledButton = styled.button`
  background: ${Colors.ANATRACITE};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  margin: 8px;
  color: white;
  &:hover {
    transition: 0.15s;
    box-shadow: 0px 0px 15px 0px ${Colors.ANATRACITE};
  }
  width: 200px;
`;

const JoinPrivateRoomModal = ({
  toggleJoinPrivateRoom,
  setToggleJoinPrivateRoom
}: any) => {
  const [roomInvite, setRoomInvite] = useState("");

  const handleModalClosing = () => {
    setRoomInvite("");
    setToggleJoinPrivateRoom(false);
  };

  return (
    <Modal isOpen={toggleJoinPrivateRoom} centered>
      <ModalHeader toggle={handleModalClosing}>Join private room</ModalHeader>
      <ModalBody>
        <StyledTextarea
          placeholder={"Paste your encrypted invite..."}
          value={roomInvite}
          onChange={e => setRoomInvite(e.target.value)}
          rows={2}
        />
      </ModalBody>
      <ModalFooter>
        <StyledButton
          color={Colors.ANATRACITE}
          //   onClick={() => handleRoomCreation(modalContent, { name: roomName })}
        >
          Join
        </StyledButton>
      </ModalFooter>
    </Modal>
  );
};

export default JoinPrivateRoomModal;
