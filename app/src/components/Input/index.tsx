import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { Room } from "../../redux/actions/actionCreator";
import { send_message } from "rln-client-lib";
import { clientUrl } from "../../constants/constants";
import { toast } from 'react-toastify';

const StyledInput = styled.input`
  border: 1px solid #f0f2f5;
  border-radius: 20px;
  width: 100%;
  position: relative;
  padding: 8px 12px;
  &:focus,
  &:active {
    outline: none;
  }
`;

const StyledChatFooterWrapper = styled.div`
  display: flex;
  svg {
    position: relative;
    top: 8px;
    left: 5px;
    cursor: pointer;
    path {
      fill: ${Colors.ANATRACITE};
    }
  }
`;

type InputProps = {
  currentActiveRoom: Room;
};

type InputState = {
  inputValue: string;
};

class Input extends React.Component<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);
    this.state = {
      inputValue: ""
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = async(event: KeyboardEvent) => {
    if (event.code === "Enter") 
      await this.handleMessageSubmit();
  };

  handleMessageSubmit = async() => {
    const { inputValue } = this.state;
    const { currentActiveRoom } = this.props;
    if (inputValue) {
      try {
        await send_message(currentActiveRoom.id, inputValue, this.generateProof);
        this.setState({ inputValue: "" })
      } catch (error) {
        toast.error("Error while sending the message. You are either banned from the chat or deleted from InteRep");
      }
    }
  };

  generateProof = async (nullifier: string, signal: string, storage_artifacts: any, rln_identitifer: string): Promise<any> => {
    const { injected } = window as any
    const client = await injected.connect();
    return await client.rlnProof(
      nullifier, 
      signal, 
      `${clientUrl}/circuitFiles/rln/rln.wasm`, 
      `${clientUrl}/circuitFiles/rln/rln_final.zkey`, 
      storage_artifacts, 
      rln_identitifer);
  }

  render() {
    const { inputValue } = this.state;

    return (
      <StyledChatFooterWrapper>
        <StyledInput
          placeholder={"Write down your message..."}
          value={inputValue}
          onChange={e => this.setState({ inputValue: e.target.value })}
        />{" "}
        <div>
          {" "}
          <FontAwesomeIcon
            icon={faPaperPlane}
            onClick={this.handleMessageSubmit}
          />{" "}
        </div>

      </StyledChatFooterWrapper>
    );
  }
}

export default Input;
