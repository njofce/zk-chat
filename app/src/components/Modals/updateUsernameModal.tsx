import { useEffect, useState } from "react"
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import { update_username, get_username } from "rln-client-lib"
import styled from "styled-components"
import * as Colors from "../../constants/colors"
import { getUserHandle } from "../../redux/actions/actionCreator"
import { useAppDispatch } from "../../redux/hooks/useAppDispatch"

const StyledInput = styled.input`
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

type UsernameModalProps = {
    setToggleUpdateUsername: (shouldToggle: boolean) => void
    toggleUpdateUsername: boolean
}

const UpdateUsernameModal = ({
    setToggleUpdateUsername,
    toggleUpdateUsername
}: UsernameModalProps) => {
    const [username, setUsername] = useState<any>("")
    const dispatch = useAppDispatch()

    useEffect(() => {
        if(toggleUpdateUsername){
            const currentUsername = get_username()
            setUsername(currentUsername)
        }
       
    }, [toggleUpdateUsername])

    const handleUsernameUpdate = () => {
        update_username(username).then(() => {
            setUsername("")
            setToggleUpdateUsername(false)
            dispatch(getUserHandle())

        })
    }

    return (
        <Modal centered isOpen={toggleUpdateUsername}>
            <ModalHeader
                toggle={() => {
                    setUsername("")
                    setToggleUpdateUsername(false)
                }}
            >
                Update Username
            </ModalHeader>
            <ModalBody>
                <StyledInput
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Your new username"
                    value={username}
                />
                <StyledButton onClick={handleUsernameUpdate}> Update </StyledButton>
            </ModalBody>
        </Modal>
    )
}

export default UpdateUsernameModal
