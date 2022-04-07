import React, { useState } from "react"
import styled from "styled-components"
import { faFileExport } from "@fortawesome/free-solid-svg-icons"
import { faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { faKey } from "@fortawesome/free-solid-svg-icons"
import { faPlusCircle, faUserLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import RoomOptionsModal from "../Modals"
import ReactTooltip from "react-tooltip"
import { saveAs } from "file-saver"

import * as Colors from "../../constants/colors"
import JoinPrivateRoomModal from "../Modals/privateRoomModal"
import TrustedContactsModal from "../Modals/trustedContactsModal"
import GeneratePublicKeyModal from "../Modals/generatePublicKey"
import { export_profile } from "rln-client-lib"

const StyledButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  position: relative;
  top: 20px;
  svg {
    font-size: 30px;
    cursor: pointer;
    path {
      fill: ${Colors.BERRY_PINK};
    }
  }
`

const RoomHandlingButtons = () => {
  const [toggleModal, setToggleModal] = useState(false)
  const [toggleJoinPrivateRoom, setToggleJoinPrivateRoom] = useState(false)
  const [toggleGeneratePublicKey, setToggleGeneratePublicKey] = useState(false)
  const [toggleTrustedContacts, setToggleTrustedContacts] = useState(false)

  const handleExportProfileClick = async () => {
    try {
      export_profile().then((json) => {
        var fileToSave = new Blob([json], {
          type: "application/json"
        })
        return saveAs(fileToSave, "Profile.json")
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <StyledButtonsWrapper>
      <FontAwesomeIcon
        icon={faPlusCircle}
        onClick={() => setToggleModal(true)}
        data-tip
        data-for="CreateRoom"
      />
      <ReactTooltip
        event="mouseenter"
        eventOff="click mouseleave"
        id="CreateRoom"
        backgroundColor={Colors.BERRY_PINK}
      >
        Create Room
      </ReactTooltip>
      <FontAwesomeIcon
        icon={faFileExport}
        data-tip
        data-for="Export"
        onClick={handleExportProfileClick}
      />{" "}
      <ReactTooltip
        event="mouseenter"
        eventOff="click mouseleave"
        id="Export"
        backgroundColor={Colors.BERRY_PINK}
      >
        Export profile
      </ReactTooltip>
      <FontAwesomeIcon
        icon={faUserPlus}
        onClick={() => setToggleJoinPrivateRoom(true)}
        data-tip
        data-for="JoinPrivateRoom"
      />
      <ReactTooltip
        event="mouseenter"
        eventOff="click mouseleave"
        id="JoinPrivateRoom"
        backgroundColor={Colors.BERRY_PINK}
      >
        Join private room
      </ReactTooltip>
      <FontAwesomeIcon
        icon={faKey}
        onClick={() => setToggleGeneratePublicKey(true)}
        data-tip
        data-for="GeneratePublicKey"
      />
      <ReactTooltip
        event="mouseenter"
        eventOff="click mouseleave"
        id="GeneratePublicKey"
        backgroundColor={Colors.BERRY_PINK}
      >
        Generate public key
      </ReactTooltip>
      <FontAwesomeIcon
        icon={faUserLock}
        onClick={() => setToggleTrustedContacts(true)}
        data-tip
        data-for="TrustedContacts"
      />
      <ReactTooltip
        event="mouseenter"
        eventOff="click mouseleave"
        id="TrustedContacts"
        backgroundColor={Colors.BERRY_PINK}
      >
        Trusted Contacts
      </ReactTooltip>
      <RoomOptionsModal
        toggleModal={toggleModal}
        setToggleModal={setToggleModal}
      />
      <JoinPrivateRoomModal
        setToggleJoinPrivateRoom={setToggleJoinPrivateRoom}
        toggleJoinPrivateRoom={toggleJoinPrivateRoom}
      />
      <GeneratePublicKeyModal
        toggleGeneratePublicKey={toggleGeneratePublicKey}
        setToggleGeneratePublicKey={setToggleGeneratePublicKey}
      />
      <TrustedContactsModal
        toggleTrustedContacts={toggleTrustedContacts}
        setToggleTrustedContacts={setToggleTrustedContacts}
      />
    </StyledButtonsWrapper>
  )
}

export default RoomHandlingButtons
