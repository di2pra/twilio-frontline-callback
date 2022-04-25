import { useCallback, useState } from "react";
import { Alert, Button, Form, FormCheck, Modal } from "react-bootstrap";
import useApi from "../../hooks/useApi";
import useForm, { FormSchema } from "../../hooks/useForm";
import { ITemplateCategory } from "../../Types";

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

type Props = {
  successCallBack: () => void
}

const useAddNewTemplateForm = ({successCallBack} : Props) => {

  const { addTemplate } = useApi();

  const [displayModal, setDisplayModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ITemplateCategory | null>(null);

  const [initState, setInitState] = useState<FormSchema>(stateSchema);
  const { state, handleOnChange, handleOnSubmit } = useForm(initState, validationStateSchema);

  const handleClose = () => {
    setSelectedCategory(null);
    setDisplayModal(false);
  };

  const handleAddBtn = (category: ITemplateCategory) => {
    setSelectedCategory(category);
    setInitState({ ...stateSchema, ...{ 
      category_id: { value: category.id, errorMessage: '', isInvalid: false },
      whatsapp_approved: { value: false, errorMessage: '', isInvalid: false }
    } })
    setDisplayModal(true);
  };

  const processAddTemplate = useCallback((state: FormSchema) => {
    addTemplate({
      category_id: state.category_id.value,
      content: state.content.value,
      whatsapp_approved: state.whatsapp_approved.value
    }).then((value) => {
      handleClose();
      successCallBack();
    })
  }, []);

  const dom = <Modal size="lg" centered backdrop="static" show={displayModal} onHide={handleClose}>
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

  return {
    modalDom: dom,
    handleAddBtn: handleAddBtn
  }

}

export default useAddNewTemplateForm;