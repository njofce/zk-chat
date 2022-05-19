import * as Colors from "../../constants/colors";
import styled from "styled-components";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import {
  get_rooms,
  init,
  receive_message,
  recover_profile,
  IRooms
} from "zk-chat-client";
import { serverUrl, socketUrl } from "../../constants/constants";
import { generateProof } from "../../util/util";
import {
  addMessageToRoomAction,
  getRoomsAction,
  loadMessagesForRooms,
  runSyncMessageHistory
} from "../../redux/actions/actionCreator";

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

const StyledInput = styled.input`
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

type RecoverModalProps = {
  setToggleRecoverModal: (shouldRecover: boolean) => void;
  toggleRecoverModal: boolean;
};
const RecoverModal = ({
  setToggleRecoverModal,
  toggleRecoverModal
}: RecoverModalProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState("");

  const loadMessagesFromDb = async () => {
    const allRooms: IRooms = await get_rooms();
    const roomIds: string[] = [
      ...allRooms.direct.map(d => d.id),
      ...allRooms.private.map(d => d.id),
      ...allRooms.public.map(d => d.id)
    ];

    const nowTimestamp: number = new Date().getTime();
    dispatch(loadMessagesForRooms(roomIds, nowTimestamp));

    await receive_message(receiveMessageCallback);
  };

  const initializeApp = async () => {
    try {
      await init({
        serverUrl: serverUrl,
        socketUrl: socketUrl
      }, generateProof).then(() => {
        navigate("/dashboard");
        dispatch(getRoomsAction());

        dispatch(
          runSyncMessageHistory({
            onSuccess: () => {
              loadMessagesFromDb();
            }
          })
        );
      });
    } catch (error) {
      navigate("/r-procedure");
    }
  };

  const receiveMessageCallback = (message: any, roomId: string) => {
    dispatch(addMessageToRoomAction(message, roomId));
  };

  const onReaderLoad = (e: any) => {
    const userObj = e.target.result;
    setUserData(userObj);
  };

  const handleFileUpload = (e: any) => {
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(e.target.files[0]);
  };

  const handleRecoverClick = () => {
    recoverProfile();
    setToggleRecoverModal(false);
  };

  const recoverProfile = async () => {
    try {
      await recover_profile(userData).then(() => initializeApp());
    } catch (error) {
      console.log(error);
      navigate("/r-procedure");
    }
  };

  return (
    <Modal centered isOpen={toggleRecoverModal}>
      <ModalHeader toggle={() => setToggleRecoverModal(false)}>
        Recover profile
      </ModalHeader>
      <ModalBody>
        {" "}
        <StyledInput type="file" accept="json/*" onChange={handleFileUpload} />
      </ModalBody>

      <ModalFooter>
        {" "}
        <StyledButton onClick={handleRecoverClick}>Recover</StyledButton>
      </ModalFooter>
    </Modal>
  );
};

export default RecoverModal;
