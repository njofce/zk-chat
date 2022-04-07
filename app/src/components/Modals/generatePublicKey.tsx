import { useEffect, useState } from "react"
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import styled from "styled-components"
import * as Colors from "../../constants/colors"
import { faCopy } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ReactTooltip from "react-tooltip"
import { get_public_key } from "rln-client-lib"

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
  setToggleGeneratePublicKey: (shouldToggle: boolean) => void
  toggleGeneratePublicKey: boolean
}

const GeneratePublicKeyModal = ({
  setToggleGeneratePublicKey,
  toggleGeneratePublicKey
}: InviteModalProps) => {
  const [generatedInvite, setDisplayGeneratedInvite] = useState("")
  const [isInviteCopied, setIsInviteCopied] = useState(false)

  useEffect(() => {
    if (toggleGeneratePublicKey) generatePublicKey()
  }, [toggleGeneratePublicKey])

  const handleInviteCopying = () => {
    navigator.clipboard.writeText(generatedInvite).then(() => {
      setIsInviteCopied(true)
      setTimeout(() => setIsInviteCopied(false), 4000)
    })
  }

  const generatePublicKey = async () => {
    try {
      get_public_key().then((key) => {
        return setDisplayGeneratedInvite(key)
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Modal centered isOpen={toggleGeneratePublicKey}>
      <ModalHeader
        toggle={() => {
          setDisplayGeneratedInvite("")
          setToggleGeneratePublicKey(false)
        }}
      >
        Generate Public Key
      </ModalHeader>
      <ModalBody>
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
          <StyledTextarea rows={10} defaultValue={generatedInvite} disabled />
          <FontAwesomeIcon
            data-tip
            data-for="CopyInviteIcon"
            icon={faCopy}
            onClick={handleInviteCopying}
          />
        </StyledInviteCodeOuterWrapper>
      </ModalBody>
    </Modal>
  )
}

export default GeneratePublicKeyModal
