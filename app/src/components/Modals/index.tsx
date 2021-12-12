import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { roomTypes } from "../../constants/constants";
import { createRoomAction } from "../../redux/actions/actionCreator";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";

const StyledButton = styled.button`
  background: ${props => props.color};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  margin: 8px;
  color: white;
  &:hover {
    transition: 0.15s;
    box-shadow: 0px 0px 15px 0px ${props => props.color};
  }
  width: 200px;
`;

const StyledInput = styled.input`
  border: 1px solid #f0f2f5;
  border-radius: 20px;
  width: 100%;
  position: relative;
  margin-bottom: 10px;
  padding: 8px 12px;
  &:focus,
  &:active {
    outline: none;
  }
`;

const StyledButtonsWrapper = styled.div`
  display: flex;
`;

type RoomOptionsModalProps = {
  setToggleModal: (shouldToggle: boolean) => void;
  toggleModal: boolean;
};

type RoomsOptionsModalProps = {
  setToggleModal: (shouldToggle: boolean) => void;
  toggleModal: boolean;
  setModalContent: (modalContent: string) => void;
};

const RoomOptionsModal = ({
  toggleModal,
  setToggleModal
}: RoomOptionsModalProps) => {
  const [modalContent, setModalContent] = useState("");
  const dispatch = useAppDispatch();

  const handleRoomCreation = (roomType: string, data: any) => {
    if (data.name) {
      dispatch(createRoomAction(roomType, data));
      setModalContent("");
      setToggleModal(false);
    }
  };
  const handleModalClosing = () => {
    setModalContent("");
    setToggleModal(false);
  };

  const getModalContent = () => {
    switch (modalContent) {
      case roomTypes.public:
        return (
          <RoomNameInput
            toggleModal={toggleModal}
            handleRoomCreation={handleRoomCreation}
            modalContent={modalContent}
            handleModalClosing={handleModalClosing}
          />
        );

      case roomTypes.private:
        return (
          <RoomNameInput
            toggleModal={toggleModal}
            handleRoomCreation={handleRoomCreation}
            modalContent={modalContent}
            handleModalClosing={handleModalClosing}
          />
        );

      case roomTypes.oneOnOne:
        return (
          <OneOnOneModal
            toggleModal={toggleModal}
            handleRoomCreation={handleRoomCreation}
            modalContent={modalContent}
            handleModalClosing={handleModalClosing}
          />
        );
      default:
        return (
          <RoomTypeOptions
            toggleModal={toggleModal}
            setModalContent={setModalContent}
            setToggleModal={setToggleModal}
          />
        );
    }
  };
  return getModalContent();
};

const RoomTypeOptions = ({
  toggleModal,
  setToggleModal,
  setModalContent
}: RoomsOptionsModalProps) => {
  return (
    <Modal isOpen={toggleModal} centered>
      {" "}
      <ModalHeader toggle={() => setToggleModal(false)}>
        Create chat room
      </ModalHeader>
      <ModalBody>
        <StyledButtonsWrapper>
          <StyledButton
            color={Colors.DARK_YELLOW}
            onClick={() => setModalContent(roomTypes.public)}
          >
            Public
          </StyledButton>
          <StyledButton
            color={Colors.BERRY_PINK}
            onClick={() => setModalContent(roomTypes.private)}
          >
            Private
          </StyledButton>
          <StyledButton
            color={Colors.ANATRACITE}
            onClick={() => setModalContent(roomTypes.oneOnOne)}
          >
            1:1
          </StyledButton>
        </StyledButtonsWrapper>
      </ModalBody>{" "}
    </Modal>
  );
};

type RoomNameInputProps = {
  toggleModal: boolean;
  handleRoomCreation: (roomType: string, data: any) => void;
  modalContent: string;
  handleModalClosing: () => void;
};

const RoomNameInput = ({
  toggleModal,
  handleRoomCreation,
  modalContent,
  handleModalClosing
}: RoomNameInputProps) => {
  const [roomName, setRoomName] = useState("");

  return (
    <Modal isOpen={toggleModal} centered>
      <ModalHeader toggle={handleModalClosing}>Room name</ModalHeader>
      <ModalBody>
        <StyledInput
          placeholder={"Write down your room's name..."}
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />
      </ModalBody>
      <ModalFooter>
        <StyledButton
          color={Colors.ANATRACITE}
          onClick={() => handleRoomCreation(modalContent, { name: roomName })}
        >
          Create
        </StyledButton>
      </ModalFooter>
    </Modal>
  );
};

const OneOnOneModal = ({
  toggleModal,
  handleRoomCreation,
  handleModalClosing
}: RoomNameInputProps) => {
  const [roomName, setRoomName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  return (
    <Modal isOpen={toggleModal} centered>
      <ModalHeader toggle={handleModalClosing}>
        Room name and public key
      </ModalHeader>
      <ModalBody>
        <StyledInput
          placeholder={"Write down your room's name..."}
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />
        <StyledInput
          placeholder={"Enter your recipient's public key..."}
          value={publicKey}
          onChange={e => setPublicKey(e.target.value)}
        />
      </ModalBody>
      <ModalFooter>
        <StyledButton
          color={Colors.ANATRACITE}
          onClick={() =>
            handleRoomCreation(roomTypes.oneOnOne, {
              name: roomName,
              publicKey
            })
          }
        >
          Create
        </StyledButton>
      </ModalFooter>
    </Modal>
  );
};
export default RoomOptionsModal;
