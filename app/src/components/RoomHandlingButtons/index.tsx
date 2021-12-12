import React, { useState } from "react";
import styled from "styled-components";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RoomOptionsModal from "../Modals";
import ReactTooltip from "react-tooltip";

import * as Colors from "../../constants/colors";
import JoinPrivateRoomModal from "../Modals/privateRoomModal";

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
`;

const RoomHandlingButtons = () => {
  const [toggleModal, setToggleModal] = useState(false);
  const [toggleJoinPrivateRoom, setToggleJoinPrivateRoom] = useState(false);

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
        // onClick={() => setToggleModal(true)}
        data-tip
        data-for="Export"
      />
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
        data-for="Join"
      />
      <ReactTooltip
        event="mouseenter"
        eventOff="click mouseleave"
        id="Join"
        backgroundColor={Colors.BERRY_PINK}
      >
        Join private room
      </ReactTooltip>
      <FontAwesomeIcon
        icon={faKey}
        // onClick={() => setToggleJoinPrivateRoom(true)}
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
      <RoomOptionsModal
        toggleModal={toggleModal}
        setToggleModal={setToggleModal}
      />
      <JoinPrivateRoomModal
        setToggleJoinPrivateRoom={setToggleJoinPrivateRoom}
        toggleJoinPrivateRoom={toggleJoinPrivateRoom}
      />
    </StyledButtonsWrapper>
  );
};

export default RoomHandlingButtons;
