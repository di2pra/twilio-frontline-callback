import { useCallback, useContext, useEffect, useState } from "react";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import useApi from "../../hooks/useApi";
import useForm, { FormSchema } from "../../hooks/useForm";
import { IConfiguration } from "../../Types";
import sanitizeHtml from 'sanitize-html';
import { addCodeTag } from "../../Helper";
import { ClaimContext } from "../../providers/ClaimProvider";
import { UserContext } from "../../SecureLayout";
import { Button } from '@twilio-paste/core/button';
import { Card } from '@twilio-paste/core/card';
import { Heading } from '@twilio-paste/core/heading';
import { Input } from '@twilio-paste/core/input';
import { HelpText } from '@twilio-paste/core/help-text';
import { Label } from '@twilio-paste/core/label';
import { Stack } from '@twilio-paste/core/stack';
import { Box } from '@twilio-paste/core/box';
import { Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';
import { TextArea } from '@twilio-paste/core/textarea';
import { Alert } from '@twilio-paste/core/alert';

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
      <Card>
        <Heading as="h2" variant="heading20">Configuration</Heading>
        <div className="d-flex flex-column justify-content-center align-items-center mt-3">
          <Spinner className="mb-3" animation="border" variant="danger" />
          <h3>Loading...</h3>
        </div>
      </Card>
    )
  }


  return (
    <>
      <Modal size="wide" ariaLabelledby="edit-config" isOpen={displayModal} onDismiss={handleClose}>
        <ModalHeader>
          <ModalHeading as="h3" id="edit-config">Modifier la configuration</ModalHeading>
        </ModalHeader>
        <Form onSubmit={(e) => { handleOnSubmit(e, processAddTemplate) }}>
          <ModalBody>
            <Stack orientation="vertical" spacing="space40">
              <Row>
                <Col>
                  <Label htmlFor="companyNameShort">Company Short Name</Label>
                  <Input aria-describedby="companyNameShort_help_text" id="companyNameShort" name="companyNameShort" type="text" placeholder="Twilio" value={String(state.companyNameShort.value)} onChange={handleOnChange} hasError={state.companyNameShort.isInvalid} />
                  {state.companyNameShort.isInvalid ? <HelpText id="companyNameShort_help_text" variant="error">{state.companyNameShort.errorMessage}</HelpText> : null}
                </Col>
                <Col>
                  <Label htmlFor="companyNameLong">Company Long Name</Label>
                  <Input aria-describedby="companyNameLong_help_text" id="companyNameLong" name="companyNameLong" type="text" placeholder="Twilio" value={String(state.companyNameLong.value)} onChange={handleOnChange} hasError={state.companyNameLong.isInvalid} />
                  {state.companyNameLong.isInvalid ? <HelpText id="companyNameLong_help_text" variant="error">{state.companyNameLong.errorMessage}</HelpText> : null}
                </Col>
              </Row>
              <div>
                <Label htmlFor="welcomeKnownContact">Phrase de bienvenue si c'est un contact existant avec un conseillé identifié</Label>
                <TextArea aria-describedby="welcomeKnownContact_help_text" id="welcomeKnownContact" name="welcomeKnownContact" value={String(state.welcomeKnownContact.value)} onChange={handleOnChange} hasError={state.welcomeKnownContact.isInvalid} />
                {state.welcomeKnownContact.isInvalid ? <HelpText id="welcomeKnownContact_help_text" variant="error">{state.welcomeKnownContact.errorMessage}</HelpText> : null}
              </div>
              <div>
                <Label htmlFor="welcomeUnknownContact">Phrase de bienvenue si contact nouveau</Label>
                <TextArea aria-describedby="welcomeUnknownContact_help_text" id="welcomeUnknownContact" name="welcomeUnknownContact" value={String(state.welcomeUnknownContact.value)} onChange={handleOnChange} hasError={state.welcomeUnknownContact.isInvalid} />
                {state.welcomeUnknownContact.isInvalid ? <HelpText id="welcomeUnknownContact_help_text" variant="error">{state.welcomeUnknownContact.errorMessage}</HelpText> : null}
              </div>
              <div>
                <Label htmlFor="agentBusyAnswer">Phrase de bienvenue si contact nouveau</Label>
                <TextArea aria-describedby="agentBusyAnswer_help_text" id="agentBusyAnswer" name="agentBusyAnswer" value={String(state.agentBusyAnswer.value)} onChange={handleOnChange} hasError={state.agentBusyAnswer.isInvalid} />
                {state.agentBusyAnswer.isInvalid ? <HelpText id="agentBusyAnswer_help_text" variant="error">{state.agentBusyAnswer.errorMessage}</HelpText> : null}
              </div>
              <div>
                <Label htmlFor="agentNotFoundAnswer">Phrase de bienvenue si contact nouveau</Label>
                <TextArea aria-describedby="agentNotFoundAnswer_help_text" id="agentNotFoundAnswer" name="agentNotFoundAnswer" value={String(state.agentNotFoundAnswer.value)} onChange={handleOnChange} hasError={state.agentNotFoundAnswer.isInvalid} />
                {state.agentNotFoundAnswer.isInvalid ? <HelpText id="agentNotFoundAnswer_help_text" variant="error">{state.agentNotFoundAnswer.errorMessage}</HelpText> : null}
              </div>
              <Alert variant="neutral">
                <Heading as="h2" variant="heading30">Les paramètres disponibles</Heading>
                <div className="ms-2 me-auto">
                  <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{companyNameShort}}`} :</code> Company Name Short</p>
                  <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{companyNameLong}}`} :</code> Company Name Long</p>
                </div>
              </Alert>
            </Stack>

          </ModalBody>
          <ModalFooter>
            <ModalFooterActions>
              <Button variant="secondary" onClick={handleClose}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">Enregistrer</Button>
            </ModalFooterActions>
          </ModalFooter>
        </Form>
      </Modal>
      <Card>
        <Heading as="h2" variant="heading20">Configuration</Heading>
        <Stack orientation="vertical" spacing="space50">
          <Row>
            <Col>
              <ReadOnlyInput label="Company Short Name" value={configuration?.info.companyNameShort || ''} />
            </Col>
            <Col>
              <ReadOnlyInput label="Company Long Name" value={configuration?.info.companyNameLong || ''} />
            </Col>
          </Row>
          <ReadOnlyInput label="Phrase de bienvenue si c'est un contact existant avec un conseillé identifié" value={configuration?.info.welcomeKnownContact || ''} />
          <ReadOnlyInput label="Phrase de bienvenue si contact nouveau" value={configuration?.info.welcomeUnknownContact || ''} />
          <ReadOnlyInput label="Réponse si le conseillé ne répond pas" value={configuration?.info.agentBusyAnswer || ''} />
          <ReadOnlyInput label="Réponse si le conseillé est introuvable" value={configuration?.info.agentNotFoundAnswer || ''} />
          {
            (claim != null && claim.ended_at === null && (claim.user === loggedInUser?.email)) ? <Button variant="primary" onClick={handleAddBtn} >Modifier</Button> : null
          }
        </Stack>
      </Card>
    </>

  )
}

function ReadOnlyInput({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Heading as="h5" variant="heading50">{label}</Heading>
      <Box
        as="p"
        backgroundColor="colorBackgroundDecorative10Weakest"
        borderWidth="borderWidth20"
        borderColor="colorBorderDecorative10Weaker"
        borderRadius="borderRadius20"
        borderStyle="solid"
        padding="space30"
        margin="space0"
      ><span dangerouslySetInnerHTML={{ __html: sanitizeHtml(addCodeTag(String(value))) }} /></Box>
    </>
  )
}

export default ConfigurationSection;