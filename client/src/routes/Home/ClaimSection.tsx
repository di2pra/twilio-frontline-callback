import { useContext } from "react";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { ClaimContext } from "../../providers/ClaimProvider";
import { UserContext } from "../../SecureLayout";

const ClaimSection = () => {

  const { claim, closeClaimHandler, addClaimHandler } = useContext(ClaimContext);
  const { loggedInUser } = useContext(UserContext);

  if (claim && claim.ended_at === null) {
    return (
      <>
        {
          claim.user === loggedInUser?.email ? <Button className="mb-3" variant="danger" onClick={() => { if (closeClaimHandler) { closeClaimHandler(claim.id) } }} >
          Libérer la démo
        </Button> : null
        }
        <Alert variant="warning">
          <p className="mb-0">La démo est actuellement utilisée par <b>{claim.user}</b>.</p>
        </Alert>
      </>
    )
  } else {
    return (
      <Button onClick={addClaimHandler} className="mb-3" variant="success">
        Réclamer la démo
      </Button>
    )
  }

}

export default ClaimSection;