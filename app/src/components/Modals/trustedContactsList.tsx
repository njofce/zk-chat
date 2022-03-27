import { useEffect, useState } from "react";

import styled from "styled-components";
import * as Colors from "../../constants/colors";

import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { getTrustedContacts } from "../../redux/actions/actionCreator";
import { useAppSelector } from "../../redux/hooks/useAppSelector";

const StyledContactWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  svg {
    margin: 0 10px;
    cursor: pointer;
    path {
      fill: ${Colors.ANATRACITE};
    }
  }
`;

const StyledContactName = styled.div`
  background: ${Colors.BERRY_PINK};
  border-radius: 8px;
  border: none;
  outline: none;
  padding: 8px 12px;
  margin: 8px;
  color: white;
  min-width: 300px;
  text-align: center;
  cursor: pointer;
`;

const StyledListWrapper = styled.div`
  max-height: 150px;
  overflow-y: scroll;
`;

const StyledList = styled.div`
  height: 150px;
`;

const StyledInputLabel = styled.div`
  font-size: 12px;
  padding: 0 10px;
  color: ${Colors.ANATRACITE};
`;

type TrustedContactsProps = {
    handleContactClick: (contactKey: string) => void;
};

const TrustedContactsList = ({ handleContactClick }: TrustedContactsProps) => {
    const [contactClicked, setContactClicked] = useState("");
    const trustedContacts = useAppSelector(
        state => state.ChatReducer.trustedContacts
    );
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getTrustedContacts());
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <StyledListWrapper>
            <StyledInputLabel> Select contact from trusted list</StyledInputLabel>
            {contactClicked ? (
                <StyledContactName>{contactClicked}</StyledContactName>
            ) : (
                <StyledList>
                    {trustedContacts.length > 0 &&
                        trustedContacts.map(contact => {
                            return (
                                <StyledContactWrapper>
                                    <StyledContactName
                                        onClick={() => {
                                            handleContactClick(contact.publicKey);
                                            setContactClicked(contact.name);
                                        }}
                                    >
                                        {contact.name}
                                    </StyledContactName>
                                </StyledContactWrapper>
                            );
                        })}
                </StyledList>
            )}
        </StyledListWrapper>
    );
};

export default TrustedContactsList;
