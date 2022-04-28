import { Alert, Button, Card, Col, Row, Table } from "react-bootstrap";
import { ITemplateCategory } from "../../../Types";
import sanitizeHtml from 'sanitize-html';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { useContext, useEffect, useState } from "react";
import { ClaimContext } from "../../../providers/ClaimProvider";
import { UserContext } from "../../../SecureLayout";

type Props = {
  category: ITemplateCategory;
  deleteTemplateById: (id: number) => void
  handleAddBtn: (category_id: number) => void
  handleEditBtn: ({ id, category_id, content, whatsapp_approved }: {
    id: number;
    category_id: number;
    content: string;
    whatsapp_approved: boolean;
  }) => void
}

const TemplateRow = ({ category, deleteTemplateById, handleAddBtn, handleEditBtn }: Props) => {

  const { claim } = useContext(ClaimContext);
  const { loggedInUser } = useContext(UserContext);

  const [editable, setEditable] = useState<boolean>(false);

  useEffect(() => {

    setEditable(claim != null && claim.ended_at === null && (claim.user === loggedInUser?.email));

  }, [claim, loggedInUser])

  if (editable) {
    return (
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{category.display_name}</Card.Title>
              <Table bordered>
                <thead>
                  <tr>
                    <td style={{ width: '60%' }} >Content</td>
                    <td className="text-center" style={{ width: '20%' }} >WhatsApp Approved ?</td>
                    <td style={{ width: '10%' }} ></td>
                    <td style={{ width: '10%' }} ></td>
                  </tr>
                </thead>
                <tbody>
                  {
                    category.templates.map((item, index) => {

                      let newContent = item.content.replace(/{{\s*[\w.]+\s*}}/g, (t1) => {
                        return `<code>${t1}</code>`
                      });

                      return (
                        <tr key={index}>
                          <td style={{ 'verticalAlign': 'middle' }}>
                            <p className="mb-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(newContent) }} />
                          </td>
                          <td className={item.whatsapp_approved ? 'text-center text-success' : 'text-center text-danger'} style={{ 'verticalAlign': 'middle', fontSize: '1.5rem' }}>{item.whatsapp_approved ? <AiOutlineCheckCircle /> : <AiOutlineCloseCircle />}</td>
                          <td className="text-center" style={{ 'verticalAlign': 'middle' }}><Button variant="warning" type="button" onClick={() => { handleEditBtn(item) }}>Modifier</Button></td>
                          <td className="text-center" style={{ 'verticalAlign': 'middle' }}><Button variant="danger" type="button" onClick={() => { deleteTemplateById(item.id) }}>Supprimer</Button></td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </Table>
              <Button onClick={() => { handleAddBtn(category.id) }}>Ajouter</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  } else {

    return (
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{category.display_name}</Card.Title>
              <Table bordered>
                <thead>
                  <tr>
                    <td style={{ width: '60%' }} >Content</td>
                    <td className="text-center" style={{ width: '20%' }} >WhatsApp Approved ?</td>
                  </tr>
                </thead>
                <tbody>
                  {
                    category.templates.map((item, index) => {

                      let newContent = item.content.replace(/{{\s*[\w.]+\s*}}/g, (t1) => {
                        return `<code>${t1}</code>`
                      });

                      return (
                        <tr key={index}>
                          <td style={{ 'verticalAlign': 'middle' }}>
                            <p className="mb-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(newContent) }} />
                          </td>
                          <td className={item.whatsapp_approved ? 'text-center text-success' : 'text-center text-danger'} style={{ 'verticalAlign': 'middle', fontSize: '1.5rem' }}>{item.whatsapp_approved ? <AiOutlineCheckCircle /> : <AiOutlineCloseCircle />}</td>
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

  }
}

export default TemplateRow;