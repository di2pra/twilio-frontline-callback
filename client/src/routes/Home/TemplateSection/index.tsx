import { useCallback, useEffect, useState } from "react";
import { Card, Spinner, Modal, Form, FormCheck, Alert, Button } from "react-bootstrap";
import useApi from "../../../hooks/useApi";
import useForm, { FormSchema } from "../../../hooks/useForm";
import { ITemplateCategory } from "../../../Types";
import TemplateRow from "./TemplateRow";

const stateSchema: FormSchema = {
  category_id: { value: null, errorMessage: '', isInvalid: false },
  content: { value: '', errorMessage: '', isInvalid: false },
  whatsapp_approved: { value: null, errorMessage: '', isInvalid: false }
};

const validationStateSchema = {
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

  const { getTemplate, deleteTemplate, addTemplate } = useApi();

  const [templates, setTemplates] = useState<ITemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [displayModal, setDisplayModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ITemplateCategory | null>(null);

  const [initState, setInitState] = useState<FormSchema>(stateSchema);
  const { state, handleOnChange, handleOnSubmit } = useForm(initState, validationStateSchema);

  const loadTemplate = useCallback((spinner: boolean) => {

    if(spinner) {
      setIsLoading(true);
    }

    getTemplate().then(data => {
      setTemplates(data);

      if(spinner) {
        setIsLoading(false);
      }
    });
  }, [getTemplate]);

  useEffect(() => {
    loadTemplate(true);
  }, []);

  const deleteTemplateById = useCallback((id: number) => {

    setIsLoading(true);

    deleteTemplate(id).finally(() => {
      getTemplate().then(data => {
        setTemplates(data);
        setIsLoading(false);
      });
    })

  }, [deleteTemplate, getTemplate]);

  const handleAddBtn = (category: ITemplateCategory) => {
    setSelectedCategory(category);
    setInitState({ ...stateSchema, ...{ 
      category_id: { value: category.id, errorMessage: '', isInvalid: false },
      whatsapp_approved: { value: false, errorMessage: '', isInvalid: false }
    } })
    setDisplayModal(true);
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setDisplayModal(false);
  };

  const processAddTemplate = useCallback((state: FormSchema) => {
    addTemplate({
      category_id: state.category_id.value,
      content: state.content.value,
      whatsapp_approved: state.whatsapp_approved.value
    }).then((value) => {
      handleClose();
      loadTemplate(false);
    })
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
      <Modal size="lg" centered backdrop="static" show={displayModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un nouveau template dans "{selectedCategory?.display_name}"</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => { handleOnSubmit(e, processAddTemplate) }}>
          <Modal.Body>
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
        <Card.Header as="h3">Templates</Card.Header>
        <Card.Body>
          {
            templates.map((category, catIndex) => {
              return <TemplateRow key={catIndex} deleteTemplateById={deleteTemplateById} category={category} handleAddBtn={handleAddBtn} />
            })
          }
        </Card.Body>
      </Card>
    </>

  )
}

export default TemplateSection;