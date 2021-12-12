import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import styled from "styled-components";
import * as Colors from "../../constants/colors";

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

  const onReaderLoad = (e: any) => {     
    const userObj = JSON.parse(e.target.result);     
  };

  const handleFileUpload = (e: any) => {
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(e.target.files[0]);
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
        <StyledButton>Recover</StyledButton>
      </ModalFooter>
    </Modal>
  );
};

export default RecoverModal;
