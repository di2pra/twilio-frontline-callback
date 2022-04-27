import { createContext, FC, useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import useApi from "../hooks/useApi";
import { IClaim } from "../Types";

export const ClaimContext = createContext<{
  claim: IClaim | null;
  addClaimHandler?: () => void;
  closeClaimHandler?: (id: number) => void;
}>({
  claim: null
});

const ClaimProvider: FC = ({ children }) => {

  const { getClaim, addClaim, closeClaim } = useApi();

  const [claim, setClaim] = useState<IClaim | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  useEffect(() => {

    let isMounted = true;

    getClaim().then((data) => {
      if (isMounted) {
        setClaim(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    }

  }, [getClaim]);

  const addClaimHandler = useCallback(() => {
    setIsLoading(true);
    addClaim().then((data) => {
      setClaim(data);
      setIsLoading(false);
    })
  }, [addClaim]);

  const closeClaimHandler = useCallback((id: number) => {
    setIsLoading(true);
    closeClaim(id).then((data) => {
      setClaim(data);
      setIsLoading(false);
    });
  }, [addClaim]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Spinner className="mb-3" animation="border" variant="danger" />
        <h3>Loading Claim...</h3>
      </div>
    )
  }

  return (
    <ClaimContext.Provider value={{
      claim: claim,
      addClaimHandler: addClaimHandler,
      closeClaimHandler: closeClaimHandler
    }}>
      {children}
    </ClaimContext.Provider>
  );

}

export default ClaimProvider;