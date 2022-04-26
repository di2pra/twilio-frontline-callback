import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import useApi from "../../hooks/useApi";
import { IConfiguration, ITemplateCategory } from "../../Types";
import useAddNewTemplateForm from "./AddNewTemplateForm";
import TemplateRow from "./TemplateRow";

export default function Home() {

  const { getTemplate, deleteTemplate, getConfiguration } = useApi();

  const [templates, setTemplates] = useState<ITemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [configuration, setConfiguration] = useState<IConfiguration | null>(null);

  const loadTemplate = useCallback(() => {
    setIsLoading(true);

    getTemplate().then(data => {
      setTemplates(data);
      setIsLoading(false);
    });
  }, [getTemplate]);

  const { modalDom, handleAddBtn } = useAddNewTemplateForm({ successCallBack: loadTemplate });

  useEffect(() => {

    loadTemplate();

    getConfiguration().then(value => {
      setConfiguration(value);
    })

  }, [getTemplate, getConfiguration]);

  const deleteTemplateById = useCallback((id: number) => {

    setIsLoading(true);

    deleteTemplate(id).finally(() => {
      getTemplate().then(data => {
        setTemplates(data);
        setIsLoading(false);
      });
    })

  }, [deleteTemplate, getTemplate]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <Spinner className="mb-3" animation="border" variant="danger" />
        <h3>Loading...</h3>
      </div>
    )
  }

  return (
    <>
      {modalDom}
      <Row className="justify-content-md-center">
        <Col lg={10}>
          <Card className="mb-3">
            <Card.Header as="h3">Instructions</Card.Header>
            <Card.Body>
              <p>Démo Frontline connectée à un CRM (Hubspot) avec support de SMS, Voice, WhatsApp sur un numéro français. Ceci est l'interface de configuration de l'application de démo Frontline.</p>
              <h6>Voice les numéros de téléphone :</h6>
              <ul>
                <li>SMS : <code>+33 6 44 64 86 41</code></li>
                <li>Voice : <code>+33 6 44 64 86 41</code></li>
                <li>WhatsApp : <code>+33 6 44 64 86 41</code></li>
              </ul>
              <h6>Les liens :</h6>
              <ul>
                <li><b>Frontline:</b> <a href="https://frontline.twilio.com" rel="noreferrer" target={"_blank"}>https://frontline.twilio.com</a> ; workspace : <code>frontline-se-france</code></li>
                <li><b>Hubspot:</b> <a href="https://app.hubspot.com/login/sso" rel="noreferrer" target={"_blank"}>https://app.hubspot.com/login/sso</a></li>
                <li><b>Flex:</b> <a href="https://flex.twilio.com/cadet-manatee-3328" rel="noreferrer" target={"_blank"}>https://flex.twilio.com/cadet-manatee-3328</a></li>
              </ul>
              <h6>Principe de fonctionnement :</h6>
              <p>Un serveur vocal accueille les appels entrants avec personnalisation du nom du client. Pour les appels entrants, vous recevrez les appels des contacts dont vous êtes le propriétaire dans Hubspot. Si un numéro n’est pas identifiable dans Hubspot alors l’appel est redirigé vers le Contact Center. De même si un appel entrant est rejeté par l’utilisateur Frontline, alors l’appel est redirigé vers le Contact Center.</p>
              <h6>Liste des Contacts :</h6>
              <p>La liste des contacts dans Frontline est synchronisée avec le CRM Hubspot. Vous devez être propriétaire d’un contact dans Hubspot pour qu’il apparaisse dans Frontline.</p>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Header as="h3">Configuration</Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Form.Group as={Col} className="mb-3" controlId="companyShortName">
                    <Form.Label>Company Short Name</Form.Label>
                    <Form.Control type="text" disabled value={configuration?.info.companyNameShort} />
                  </Form.Group>
                  <Form.Group as={Col} className="mb-3" controlId="companyLongName">
                    <Form.Label>Company Long Name</Form.Label>
                    <Form.Control type="text" disabled value={configuration?.info.companyNameLong} />
                  </Form.Group>
                </Row>
              </Form>
              <Button variant="warning" >Modifier</Button>
            </Card.Body>
          </Card>
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
        </Col>
      </Row>
    </>
  )

}