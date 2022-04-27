import { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import useApi from "../../hooks/useApi";
import useForm, { FormSchema } from "../../hooks/useForm";
import { IConfiguration } from "../../Types";
import sanitizeHtml from 'sanitize-html';
import { addCodeTag } from "../../Helper";
import { ClaimContext } from "../../providers/ClaimProvider";
import { UserContext } from "../../SecureLayout";

const stateSchema: FormSchema = {
  companyNameShort: { value: '', errorMessage: '', isInvalid: false },
  companyNameLong: { value: '', errorMessage: '', isInvalid: false },
  welcomeKnownContact: { value: '', errorMessage: '', isInvalid: false },
  welcomeUnknownContact: { value: '', errorMessage: '', isInvalid: false },
  agentBusyAnswer: { value: '', errorMessage: '', isInvalid: false },
  agentNotFoundAnswer: { value: '', errorMessage: '', isInvalid: false }
};

const validationStateSchema = {
  companyNameShort: {
    required: true
  },
  companyNameLong: {
    required: true
  },
  welcomeKnownContact: {
    required: true
  },
  welcomeUnknownContact: {
    required: true
  },
  agentBusyAnswer: {
    required: true
  },
  agentNotFoundAnswer: {
    required: true
  }
};

const ConfigurationSection = () => {

  const { getConfiguration, addConfiguration } = useApi();

  const { claim } = useContext(ClaimContext);
  const { loggedInUser } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [configuration, setConfiguration] = useState<IConfiguration | null>(null);
  const [displayModal, setDisplayModal] = useState<boolean>(false);

  const [initState, setInitState] = useState<FormSchema>(stateSchema);
  const { state, handleOnChange, handleOnSubmit } = useForm(initState, validationStateSchema);

  const loadConfiguration = useCallback((spinner: boolean) => {

    if (spinner) {
      setIsLoading(true);
    }

    getConfiguration().then(value => {
      setConfiguration(value);

      if (spinner) {
        setIsLoading(false);
      }

    })
  }, [getConfiguration]);

  const handleAddBtn = () => {

    setInitState({
      ...stateSchema, ...{
        companyNameLong: { value: configuration?.info.companyNameLong || '', errorMessage: '', isInvalid: false },
        companyNameShort: { value: configuration?.info.companyNameShort || '', errorMessage: '', isInvalid: false },
        welcomeKnownContact: { value: configuration?.info.welcomeKnownContact || '', errorMessage: '', isInvalid: false },
        welcomeUnknownContact: { value: configuration?.info.welcomeUnknownContact || '', errorMessage: '', isInvalid: false },
        agentBusyAnswer: { value: configuration?.info.agentBusyAnswer || '', errorMessage: '', isInvalid: false },
        agentNotFoundAnswer: { value: configuration?.info.agentNotFoundAnswer || '', errorMessage: '', isInvalid: false }
      }
    });

    setDisplayModal(true);
  };

  const handleClose = () => {
    setDisplayModal(false);
  };

  const processAddTemplate = useCallback((state: FormSchema) => {
    addConfiguration({
      companyNameShort: String(state.companyNameShort.value),
      companyNameLong: String(state.companyNameLong.value),
      welcomeKnownContact: String(state.welcomeKnownContact.value),
      welcomeUnknownContact: String(state.welcomeUnknownContact.value),
      agentBusyAnswer: String(state.agentBusyAnswer.value),
      agentNotFoundAnswer: String(state.agentNotFoundAnswer.value)
    }).then((value) => {
      handleClose();
      loadConfiguration(false);
    })
  }, []);

  useEffect(() => {
    loadConfiguration(true);
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-3">
        <Card.Header as="h3">Configuration</Card.Header>
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
    <>
      <Modal size="xl" centered backdrop="static" show={displayModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier la configuration</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => { handleOnSubmit(e, processAddTemplate) }}>
          <Modal.Body>
            <Row>
              <Form.Group as={Col} className="mb-3" controlId="companyNameShort">
                <Form.Label>Company Short Name</Form.Label>
                <Form.Control type="text" value={String(state.companyNameShort.value)} name='companyNameShort' isInvalid={state.companyNameShort.isInvalid} onChange={handleOnChange} />
                <div className="invalid-feedback">{state.companyNameShort.errorMessage}</div>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="companyNameLong">
                <Form.Label>Company Long Name</Form.Label>
                <Form.Control type="text" value={String(state.companyNameLong.value)} name='companyNameLong' isInvalid={state.companyNameLong.isInvalid} onChange={handleOnChange} />
                <div className="invalid-feedback">{state.companyNameLong.errorMessage}</div>
              </Form.Group>
            </Row>
            <Form.Group as={Col} className="mb-3" controlId="welcomeKnownContact">
              <Form.Label>Phrase de bienvenue si c'est un contact existant avec un conseillé identifié</Form.Label>
              <Form.Control as="textarea" rows={3} value={String(state.welcomeKnownContact.value)} name='welcomeKnownContact' isInvalid={state.welcomeKnownContact.isInvalid} onChange={handleOnChange} />
              <div className="invalid-feedback">{state.welcomeKnownContact.errorMessage}</div>
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="welcomeUnknownContact">
              <Form.Label>Phrase de bienvenue si contact nouveau</Form.Label>
              <Form.Control as="textarea" rows={3} value={String(state.welcomeUnknownContact.value)} name='welcomeUnknownContact' isInvalid={state.welcomeUnknownContact.isInvalid} onChange={handleOnChange} />
              <div className="invalid-feedback">{state.welcomeUnknownContact.errorMessage}</div>
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="agentBusyAnswer">
              <Form.Label>Réponse si le conseillé ne répond pas</Form.Label>
              <Form.Control as="textarea" rows={3} value={String(state.agentBusyAnswer.value)} name='agentBusyAnswer' isInvalid={state.agentBusyAnswer.isInvalid} onChange={handleOnChange} />
              <div className="invalid-feedback">{state.agentBusyAnswer.errorMessage}</div>
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="agentNotFoundAnswer">
              <Form.Label>Réponse si le conseillé est introuvable</Form.Label>
              <Form.Control as="textarea" rows={3} value={String(state.agentNotFoundAnswer.value)} name='agentNotFoundAnswer' isInvalid={state.agentNotFoundAnswer.isInvalid} onChange={handleOnChange} />
              <div className="invalid-feedback">{state.agentNotFoundAnswer.errorMessage}</div>
            </Form.Group>
            <Alert className="mt-3" variant="success">
              <Alert.Heading as="h6">Les paramètres disponibles :</Alert.Heading>
              <hr />
              <div className="ms-2 me-auto">
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{companyNameShort}}`} :</code> Company Name Short</p>
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{companyNameLong}}`} :</code> Company Name Long</p>
              </div>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Enregistrer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Card className="mb-3">
        <Card.Header as="h3">Configuration</Card.Header>
        <Card.Body>
          <Row>
            <Col>
              <h6>Company Short Name</h6>
              <Alert className="mb-4 p-2" variant='secondary'>
                <p className="mb-0">{configuration?.info.companyNameShort}</p>
              </Alert>
            </Col>
            <Col>
              <h6>Company Long Name</h6>
              <Alert className="mb-4 p-2" variant='secondary'>
                <p className="mb-0">{configuration?.info.companyNameLong}</p>
              </Alert>
            </Col>
          </Row>
          <h6>Phrase de bienvenue si c'est un contact existant avec un conseillé identifié</h6>
          <Alert className="mb-4 p-2" variant='secondary'>
            <p className="mb-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(addCodeTag(String(configuration?.info.welcomeKnownContact))) }} />
          </Alert>
          <h6>Phrase de bienvenue si contact nouveau</h6>
          <Alert className="mb-4 p-2" variant='secondary'>
            <p className="mb-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(addCodeTag(String(configuration?.info.welcomeUnknownContact))) }} />
          </Alert>
          <h6>Réponse si le conseillé ne répond pas</h6>
          <Alert className="mb-4 p-2" variant='secondary'>
            <p className="mb-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(addCodeTag(String(configuration?.info.agentBusyAnswer))) }} />
          </Alert>
          <h6>Réponse si le conseillé est introuvable</h6>
          <Alert className="mb-4 p-2" variant='secondary'>
            <p className="mb-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(addCodeTag(String(configuration?.info.agentNotFoundAnswer))) }} />
          </Alert>
          {
            (claim != null && claim.ended_at === null && (claim.user === loggedInUser?.email)) ? <Button variant="warning" onClick={handleAddBtn} >Modifier</Button> : null
          }
        </Card.Body>
      </Card>
    </>

  )
}

export default ConfigurationSection;