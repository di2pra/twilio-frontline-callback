import { useCallback, useEffect, useState } from "react";
import { Card, Spinner, Form, FormCheck, Alert } from "react-bootstrap";
import useApi from "../../../hooks/useApi";
import useForm, { FormSchema } from "../../../hooks/useForm";
import { ITemplateCategory } from "../../../Types";
import TemplateRow from "./TemplateRow";
import { Button } from '@twilio-paste/core/button';
import { Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';

const stateSchema: FormSchema = {
  id: { value: null, errorMessage: '', isInvalid: false },
  category_id: { value: null, errorMessage: '', isInvalid: false },
  content: { value: '', errorMessage: '', isInvalid: false },
  whatsapp_approved: { value: null, errorMessage: '', isInvalid: false }
};

const validationStateSchema = {
  id: {
    required: false
  },
  category_id: {
    required: true
  },
  content: {
    required: true
  },
  whatsapp_approved: {
    required: true
  }
};


const TemplateSection = () => {

  const { getTemplate, deleteTemplate, addTemplate, updateTemplate } = useApi();

  const [templates, setTemplates] = useState<ITemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [displayModal, setDisplayModal] = useState<boolean>(false);

  const [initState, setInitState] = useState<FormSchema>(stateSchema);
  const { state, handleOnChange, handleOnSubmit } = useForm(initState, validationStateSchema);

  const loadTemplate = useCallback((spinner: boolean) => {

    if (spinner) {
      setIsLoading(true);
    }

    getTemplate().then(data => {
      setTemplates(data);

      if (spinner) {
        setIsLoading(false);
      }
    });
  }, [getTemplate]);

  useEffect(() => {
    loadTemplate(true);
  }, [loadTemplate]);

  const deleteTemplateById = useCallback((id: number) => {

    setIsLoading(true);

    deleteTemplate(id).finally(() => {
      getTemplate().then(data => {
        setTemplates(data);
        setIsLoading(false);
      });
    })

  }, [deleteTemplate, getTemplate]);

  const handleAddBtn = (category_id: number) => {
    setInitState({
      ...stateSchema, ...{
        category_id: { value: category_id, errorMessage: '', isInvalid: false },
        whatsapp_approved: { value: false, errorMessage: '', isInvalid: false }
      }
    })
    setDisplayModal(true);
  };

  const handleEditBtn = ({ id, category_id, content, whatsapp_approved }: { id: number, category_id: number, content: string, whatsapp_approved: boolean }) => {
    setInitState({
      ...stateSchema, ...{
        id: { value: id, errorMessage: '', isInvalid: false },
        category_id: { value: category_id, errorMessage: '', isInvalid: false },
        content: { value: content, errorMessage: '', isInvalid: false },
        whatsapp_approved: { value: whatsapp_approved, errorMessage: '', isInvalid: false }
      }
    });
    setDisplayModal(true);
  };

  const handleClose = () => {
    setDisplayModal(false);
  };

  const processAddTemplate = useCallback((state: FormSchema) => {

    if (state.id.value === null) {
      addTemplate({
        category_id: state.category_id.value,
        content: state.content.value,
        whatsapp_approved: state.whatsapp_approved.value
      }).then((value) => {
        handleClose();
        loadTemplate(false);
        setInitState(stateSchema);
      });
    } else {
      updateTemplate(state.id.value, {
        category_id: state.category_id.value,
        content: state.content.value,
        whatsapp_approved: state.whatsapp_approved.value
      }).then((value) => {
        handleClose();
        loadTemplate(false);
        setInitState(stateSchema);
      });
    }


  }, [addTemplate, updateTemplate, loadTemplate]);

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
      <Modal size="wide" ariaLabelledby="edit-template" isOpen={displayModal} onDismiss={handleClose}>
        <ModalHeader>
          <ModalHeading as="h3" id="edit-template">Ajouter un nouveau template</ModalHeading>
        </ModalHeader>
        <Form onSubmit={(e) => { handleOnSubmit(e, processAddTemplate) }}>
          <ModalBody>
            <Form.Group className="mb-3" controlId="formTemplateBody">
              <Form.Label>Template</Form.Label>
              <Form.Control as="textarea" rows={3} value={String(state.content.value)} name='content' isInvalid={state.content.isInvalid} onChange={handleOnChange} placeholder="Bonjour {{customerFirstname}} nous avons traité vos documents, vous pouvez me contacter ici. {{agentFirstname}}." />
              <div className="invalid-feedback">{state.content.errorMessage}</div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTemplateWhatsappApproved">
              <Form.Check
                type="switch"
                id="whatsapp-switch"
                label=""
              >
                <FormCheck.Input
                  name="whatsapp_approved"
                  checked={Boolean(state.whatsapp_approved.value)}
                  onChange={handleOnChange} />
                <FormCheck.Label>WhatsApp Approved</FormCheck.Label>
              </Form.Check>
            </Form.Group>
            <Alert className="mt-3" variant="success">
              <Alert.Heading as="h6">Les paramètres disponibles :</Alert.Heading>
              <hr />
              <div className="ms-2 me-auto">
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{customerFirstname}}`}</code> : Customer Firstname</p>
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{customerLastname}}`} :</code> Customer Last Name</p>
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{agentFirstname}}`} :</code> Agent Firstname</p>
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{agentLastname}}`} :</code> Agent Lastname</p>
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{companyNameShort}}`} :</code> Company Name Short</p>
                <p className="m-0" style={{ fontSize: '0.8rem' }}><code>{`{{companyNameLong}}`} :</code> Company Name Long</p>
              </div>
            </Alert>
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
      <Card className="mb-3">
        <Card.Header as="h3">Templates</Card.Header>
        <Card.Body>
          {
            templates.map((category, catIndex) => {
              return <TemplateRow key={catIndex} deleteTemplateById={deleteTemplateById} category={category} handleAddBtn={handleAddBtn} handleEditBtn={handleEditBtn} />
            })
          }
        </Card.Body>
      </Card>
    </>

  )
}

export default TemplateSection;