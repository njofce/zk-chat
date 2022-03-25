import React from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";

const StyledSpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: column;
  color: white;
  div {
    height: 5rem;
    width: 5rem;
  }
`;

const SyncSpinner = () => (
  <StyledSpinnerWrapper>
    <Spinner
      animation="grow"
      role="status"
      variant="light"
      className="spinner-grow text-light"
    />
    Loading messages...
  </StyledSpinnerWrapper>
);

export default SyncSpinner;
