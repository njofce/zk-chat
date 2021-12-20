import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { invite_private_room } from "rln-client-lib";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { Room } from "../../redux/actions/actionCreator";

const StyledButton = styled.button`
  background: ${Colors.ANATRACITE};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  margin: 8px;
  margin-left: auto;
  color: white;
  &:hover {
    transition: 0.15s;
    box-shadow: 0px 0px 15px 0px ${Colors.ANATRACITE};
  }
  width: 200px;
`;

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

const StyledInviteCodeOuterWrapper = styled.div`
  color: ${Colors.ANATRACITE};
  margin: 8px;
  display: flex;
  align-items: center;
  
  svg {
    font-size: 30px;
    cursor: pointer;
    position: relative;
    left: 10px;
  }
`;
const StyledInviteCodeInnerWrapper = styled.div`
  border: 1px solid #f0f2f5;
  border-radius: 20px;
  border: 1 px solid #f0f2f5;
  border-radius: 20px;
  padding: 8px 12px;
  margin: 10px 0;
  word-break: break-all;
`;
 
type InviteModalProps = {
  setToggleInviteModal: (shouldToggle: boolean) => void;
  toggleInviteModal: boolean;
};

const InviteModal = ({
  setToggleInviteModal,
  toggleInviteModal
}: InviteModalProps) => {
  const [keyValue, setKeyValue] = useState("");
  const [generatedInvite, setDisplayGeneratedInvite] = useState("");
  const [isInviteCopied, setIsInviteCopied] = useState(false);
  //@ts-ignore
  const currentActiveRoom: Room   = useAppSelector(
    state => state.ChatReducer.currentActiveRoom
  );
  const handleInviteCopying = () => {
    setIsInviteCopied(true);
    navigator.clipboard.writeText(generatedInvite).then(() => {
      setTimeout(() => setIsInviteCopied(false), 4000);
    });
  };

  const handleGenerateInvite = async () => {     
    try {
      await invite_private_room(currentActiveRoom?.id, keyValue).then(invite => setDisplayGeneratedInvite(invite)
    );
    } catch (error) {
      console.log(error)
    }
  }; 

  return (
    <Modal centered isOpen={toggleInviteModal}>
      <ModalHeader toggle={() => setToggleInviteModal(false)}>
        Invite to private room
      </ModalHeader>
      <ModalBody>
        <StyledTextarea
          rows={2}
          value={keyValue}
          onChange={e => setKeyValue(e.target.value)}
          placeholder="Enter your recipient's public key..."
        />
        <StyledButton onClick={handleGenerateInvite}>
          Generate invite
        </StyledButton>
        {generatedInvite && (
          <StyledInviteCodeOuterWrapper>
            <ReactTooltip
              event="mouseenter"
              eventOff="mouseleave"
              id="CopyInviteIcon"
              backgroundColor={Colors.ANATRACITE}
            >
              {" "}
              {isInviteCopied
                ? "Invite code copied"
                : "Copy the invite code below"}{" "}
            </ReactTooltip>
            <StyledInviteCodeInnerWrapper>
              {generatedInvite}
            </StyledInviteCodeInnerWrapper>
            <FontAwesomeIcon
              data-tip
              data-for="CopyInviteIcon"
              icon={faCopy}
              onClick={handleInviteCopying}
            />
          </StyledInviteCodeOuterWrapper>
        )}
      </ModalBody>
    </Modal>
  );
};

export default InviteModal;
