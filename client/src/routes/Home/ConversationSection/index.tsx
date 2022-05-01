import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Card, Spinner, Table } from "react-bootstrap";
import useApi from "../../../hooks/useApi";
import { ClaimContext } from "../../../providers/ClaimProvider";
import { UserContext } from "../../../SecureLayout";
import { IConversation } from "../../../Types";

const ConversationSection = () => {

  const { getConversation, deleteAllConversation } = useApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationList, setConversationList] = useState<IConversation[]>([]);

  const { claim } = useContext(ClaimContext);
  const { loggedInUser } = useContext(UserContext);

  useEffect(() => {

    setIsLoading(true);

    getConversation().then((data) => {
      setConversationList(data);
      setIsLoading(false);
    });


  }, [getConversation]);

  const deleteHandler = useCallback(() => {

    setIsLoading(true);

    deleteAllConversation().then(() => {
      getConversation().then((data) => {
        setConversationList(data);
        setIsLoading(false);
      });
    })

  }, [deleteAllConversation, getConversation])

  if (isLoading) {
    return (
      <Card className="mb-3">
        <Card.Header as="h3">Conversations</Card.Header>
        <Card.Body>
          <div className="d-flex flex-column justify-content-center align-items-center mt-3">
            <Spinner className="mb-3" animation="border" variant="danger" />
            <h3>Loading...</h3>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className="mb-3">
      <Card.Header as="h3">Conversations</Card.Header>
      <Card.Body>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Friendly Name</th>
              <th>Created</th>
              <th>Last Updated</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {
              conversationList.map((item, index) => {
                return (<tr key={index}>
                  <td>{item.friendlyName}</td>
                  <td>{`${(new Date(item.dateCreated)).toLocaleDateString()} ${(new Date(item.dateCreated)).toLocaleTimeString()}`}</td>
                  <td>{`${(new Date(item.dateUpdated)).toLocaleDateString()} ${(new Date(item.dateUpdated)).toLocaleTimeString()}`}</td>
                  <td>{item.state}</td>
                </tr>)
              })
            }
          </tbody>
        </Table>
        {
          (claim != null && claim.ended_at === null && (claim.user === loggedInUser?.email)) ? <Button variant="danger" onClick={deleteHandler}>Delete All</Button> : null
        }
      </Card.Body>
    </Card>
  )
}

export default ConversationSection;