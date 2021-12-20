import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { send_message } from "rln-client-lib";
import { Room } from "../../redux/actions/actionCreator";

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

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Enter") this.handleMessageSubmit();
  };

  handleMessageSubmit = () => {
    const { inputValue } = this.state;
    const { currentActiveRoom } = this.props;
    if (inputValue) {
      try {
        send_message(currentActiveRoom.id, inputValue).then(() =>
          this.setState({ inputValue: "" })
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

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
