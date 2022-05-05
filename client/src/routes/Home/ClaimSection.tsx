import { useContext } from "react";
import { Button } from '@twilio-paste/core/button';
import { Alert } from '@twilio-paste/core/alert';
import { ClaimContext } from "../../providers/ClaimProvider";
import { UserContext } from "../../SecureLayout";

const ClaimSection = () => {

  const { claim, closeClaimHandler, addClaimHandler } = useContext(ClaimContext);
  const { loggedInUser } = useContext(UserContext);

  if (claim && claim.ended_at === null) {
    return (
      <>
        {
          claim.user === loggedInUser?.email ? <div className="mb-3">
            <Button variant="destructive" onClick={() => { if (closeClaimHandler) { closeClaimHandler(claim.id) } }} >
              Libérer la démo
            </Button>
          </div> : null
        }
        <Alert variant="neutral">
          <p className="mb-0">La démo est actuellement utilisée par <b>{claim.user}</b>.</p>
        </Alert>
      </>
    )
  } else {
    return (
      <div className="mb-3">
        <Button onClick={addClaimHandler} variant="primary">
          Réclamer la démo
        </Button>
      </div>
    )
  }

}

export default ClaimSection;