import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Row, Spinner, Table } from "react-bootstrap";
import useApi from "../hooks/useApi";
import { ITemplateCategory } from "../Types";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import sanitizeHtml from 'sanitize-html';

export default function Home() {

  const { getTemplate, deleteTemplate } = useApi();

  const [templates, setTemplates] = useState<ITemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {

    setIsLoading(true);

    getTemplate().then(data => {
      setTemplates(data);
      setIsLoading(false);
    })

  }, [getTemplate]);

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
    <Row className="justify-content-md-center">
      <Col lg={10}>
        <h2>Instructions</h2>
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

        <h2>Templates</h2>
        {
          templates.map((category, catIndex) => {
            return (
              <Row key={catIndex}>
                <Col>
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>{category.display_name}</Card.Title>
                      <Table bordered>
                        <thead>
                          <tr>
                            <td style={{ width: '60%' }} >Content</td>
                            <td className="text-center" style={{ width: '20%' }} >WhatsApp Approved ?</td>
                            <td style={{ width: '20%' }} ></td>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            category.templates.map((item, index) => {

                              let newContent = item.content.replace(/{{\s*[\w.]+\s*}}/g, (t1) => {
                                return `<code>${t1}</code>`
                              });

                              console.log(newContent)

                              return (
                                <tr key={index}>
                                  <td><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(newContent) }} /></td>
                                  <td className={item.whatsAppApproved ? 'text-center text-success' : 'text-center text-danger'} style={{ 'verticalAlign': 'middle', fontSize: '1.5rem' }}>{item.whatsAppApproved ? <AiOutlineCheckCircle /> : <AiOutlineCloseCircle />}</td>
                                  <td className="text-center" style={{ 'verticalAlign': 'middle' }}><Button variant="danger" type="button" onClick={() => { deleteTemplateById(item.id) }}>Supprimer</Button></td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )
          })
        }
        <Row>
          <Col>
            <Alert variant="success">
              <Alert.Heading>Les paramètres disponibles :</Alert.Heading>
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
          </Col>
        </Row>
      </Col>
    </Row>
  )

}