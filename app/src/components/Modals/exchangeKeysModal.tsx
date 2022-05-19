import { useState } from "react"
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import styled from "styled-components"
import * as Colors from "../../constants/colors"
import { faCopy } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ReactTooltip from "react-tooltip"
import {
  generate_encrypted_invite_direct_room,
  update_direct_room_key
} from "zk-chat-client"
import { useAppSelector } from "../../redux/hooks/useAppSelector"

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
`

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
`
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
`

type InviteModalProps = {
  setToggleExchangeKeysModal: (shouldToggle: boolean) => void
  toggleExchangeKeysModal: boolean
}

const ExcangeKeysModal = ({
  setToggleExchangeKeysModal,
  toggleExchangeKeysModal
}: InviteModalProps) => {
  const [roomKey, setRoomKey] = useState("")
  const [recipientKey, setRecipientKey] = useState("")
  const [isInviteCopied, setIsInviteCopied] = useState(false)
  const currentActiveRoom = useAppSelector(
    (state) => state.ChatReducer.currentActiveRoom
  )

  const handleInviteCopying = () => {
    setIsInviteCopied(true)
    navigator.clipboard.writeText(roomKey).then(() => {
      setTimeout(() => setIsInviteCopied(false), 4000)
    })
  }

  const handleGenerateRoomKey = async () => {
    try {
      //@ts-ignore
      await generate_encrypted_invite_direct_room(currentActiveRoom?.id).then(
        (invite) => setRoomKey(invite)
      )
    } catch (error) {
      setRoomKey("Error while generating invite")
    }
  }

  const handleUpdateKey = async () => {
    try {
      //@ts-ignore
      await update_direct_room_key(currentActiveRoom?.id, recipientKey).then(
        (invite) => {
          setRoomKey("")
          setRecipientKey("")
          setToggleExchangeKeysModal(false)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  const handleModalClosing = () => {
    setRoomKey("")
    setRecipientKey("")
    setToggleExchangeKeysModal(false)
  }

  return (
    <Modal centered isOpen={toggleExchangeKeysModal}>
      <ModalHeader toggle={handleModalClosing}>Exchange keys</ModalHeader>
      <ModalBody>
        <StyledInviteCodeOuterWrapper>
          <ReactTooltip
            event="mouseenter"
            eventOff="mouseleave"
            id="CopyKeyIcon"
            backgroundColor={Colors.ANATRACITE}
          >
            {isInviteCopied ? "Key copied" : "Copy the key"}
          </ReactTooltip>
          <StyledTextarea
            rows={roomKey ? 10 : 2}
            value={roomKey}
            disabled
            placeholder="Click the button to generate your room's key"
          />
          {roomKey && (
            <FontAwesomeIcon
              data-tip
              data-for="CopyKeyIcon"
              icon={faCopy}
              onClick={handleInviteCopying}
            />
          )}
        </StyledInviteCodeOuterWrapper>
        <StyledButton onClick={handleGenerateRoomKey}>
          Generate key
        </StyledButton>
        <StyledTextarea
          rows={2}
          value={recipientKey}
          onChange={(e) => setRecipientKey(e.target.value)}
          placeholder="Enter your recipient's key..."
        />
        <StyledButton onClick={handleUpdateKey}>Update key</StyledButton>
      </ModalBody>
    </Modal>
  )
}

export default ExcangeKeysModal
