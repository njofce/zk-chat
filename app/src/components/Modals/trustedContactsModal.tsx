import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import styled from "styled-components";
import * as Colors from "../../constants/colors";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import {
    delete_contact,
    get_contact,
    insert_contact,
    update_contact
} from "rln-client-lib";
import { useAppDispatch } from "../../redux/hooks/useAppDispatch";
import { getTrustedContacts } from "../../redux/actions/actionCreator";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { toast } from 'react-toastify';

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

const StyledContactWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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
`;

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const StyledInputLabel = styled.div`
  font-size: 12px;
  padding: 0 10px;
  color: ${Colors.ANATRACITE};
  margin-top: 25px;
`;

type TrustedContactsProps = {
    setToggleTrustedContacts: (shouldToggle: boolean) => void;
    toggleTrustedContacts: boolean;
};

const TrustedContactsModal = ({
    setToggleTrustedContacts,
    toggleTrustedContacts
}: TrustedContactsProps) => {
    const [toggleAddEditModal, setToggleAddEditModal] = useState(false);
    const [editContactName, setEditContactName] = useState("");
    const trustedContacts = useAppSelector(
        state => state.ChatReducer.trustedContacts
    );
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getTrustedContacts());
    }, [toggleTrustedContacts]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleContactDeleting = (name: string) => {
        if (name) {
            delete_contact(name)
                .then(() => dispatch(getTrustedContacts()))
                .catch(err => toast.error(err));
        }
    };

    return (
        <Modal centered isOpen={toggleTrustedContacts}>
            <ModalHeader
                toggle={() => {
                    setToggleTrustedContacts(false);
                }}
            >
                Trusted Contacts
            </ModalHeader>
            <ModalBody>
                {trustedContacts.length > 0 ? (
                    trustedContacts.map(contact => {
                        return (
                            <StyledContactWrapper>
                                {" "}
                                <StyledContactName>{contact}</StyledContactName>
                                <div>
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        onClick={() => {
                                            setToggleAddEditModal(true);
                                            setEditContactName(contact);
                                        }}
                                        data-tip
                                        data-for="EditContact"
                                    />
                                    <ReactTooltip
                                        event="mouseenter"
                                        eventOff="click mouseleave"
                                        id="EditContact"
                                        backgroundColor={Colors.ANATRACITE}
                                    >
                                        EditContact
                                    </ReactTooltip>
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        onClick={() => {
                                            handleContactDeleting(contact);
                                        }}
                                        data-tip
                                        data-for="DeleteContact"
                                    />
                                    <ReactTooltip
                                        event="mouseenter"
                                        eventOff="click mouseleave"
                                        id="DeleteContact"
                                        backgroundColor={Colors.ANATRACITE}
                                    >
                                        Delete Contact
                                    </ReactTooltip>
                                </div>
                            </StyledContactWrapper>
                        );
                    })
                ) : (
                    <StyledContactName> No Trusted Contacts Yet</StyledContactName>
                )}
                <StyledButtonWrapper>
                    <StyledButton onClick={() => setToggleAddEditModal(true)}>
                        Create Trusted Contact
                    </StyledButton>
                </StyledButtonWrapper>

                <AddEditContactModal
                    name={editContactName}
                    setToggleAddEditModal={setToggleAddEditModal}
                    toggleAddEditModal={toggleAddEditModal}
                    setEditContactName={setEditContactName}
                />
            </ModalBody>
        </Modal>
    );
};

type AddEditModalProps = {
    name?: string;
    setToggleAddEditModal: (shouldToggle: boolean) => void;
    toggleAddEditModal: boolean;
    setEditContactName: (name: string) => void;
};

const AddEditContactModal = ({
    name,
    setToggleAddEditModal,
    toggleAddEditModal,
    setEditContactName
}: AddEditModalProps) => {
    const [contactName, setContactName] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (name) {
            get_contact(name)
                .then(contactDetails => {
                    setContactName(contactDetails.name);
                    setPublicKey(contactDetails.publicKey);
                })
                .catch(err => toast.error(err));
        }
    }, [toggleAddEditModal]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleContactSaving = () => {
        if (contactName && publicKey) {
            if (name) {
                update_contact(name, contactName, publicKey)
                    .then(() => {
                        dispatch(getTrustedContacts());
                        setPublicKey("");
                        setContactName("");
                        setEditContactName("");
                        setToggleAddEditModal(false);
                    })
                    .catch(err => toast.error(err));
            } else {
                insert_contact(contactName, publicKey)
                    .then(() => {
                        dispatch(getTrustedContacts());
                        setPublicKey("");
                        setContactName("");
                        setEditContactName("");
                        setToggleAddEditModal(false);
                    })
                    .catch(err => toast.error(err));
            }
        }
    };

    return (
        <Modal centered isOpen={toggleAddEditModal}>
            <ModalHeader
                toggle={() => {
                    setContactName("");
                    setPublicKey("");
                    setEditContactName("");
                    setToggleAddEditModal(false);
                }}
            >
                {name ? "Edit Contact" : "Create Trusted Contact"}
            </ModalHeader>
            <ModalBody>
                <StyledInputLabel>Name </StyledInputLabel>
                <StyledInput
                    value={contactName}
                    placeholder="Write down your trusted contact's name"
                    onChange={e => setContactName(e.target.value)}
                />

                <StyledInputLabel> Public Key </StyledInputLabel>
                <StyledTextarea
                    value={publicKey}
                    rows={10}
                    placeholder="Enter public key"
                    onChange={e => setPublicKey(e.target.value)}
                />
                <StyledButtonWrapper>
                    <StyledButton onClick={handleContactSaving}>
                        {name ? "Update" : "Create"}
                    </StyledButton>
                </StyledButtonWrapper>
            </ModalBody>
        </Modal>
    );
};

export default TrustedContactsModal;
