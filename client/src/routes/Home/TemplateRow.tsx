import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { ITemplateCategory } from "../../Types";
import sanitizeHtml from 'sanitize-html';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';

type Props = {
  category: ITemplateCategory;
  deleteTemplateById: (id: number) => void
  handleAddBtn: (category: ITemplateCategory) => void
}

const TemplateRow = ({category, deleteTemplateById, handleAddBtn} : Props) => {
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
                  <td style={{ width: '20%' }} ></td>
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
                        <td><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(newContent) }} /></td>
                        <td className={item.whatsapp_approved ? 'text-center text-success' : 'text-center text-danger'} style={{ 'verticalAlign': 'middle', fontSize: '1.5rem' }}>{item.whatsapp_approved ? <AiOutlineCheckCircle /> : <AiOutlineCloseCircle />}</td>
                        <td className="text-center" style={{ 'verticalAlign': 'middle' }}><Button variant="danger" type="button" onClick={() => { deleteTemplateById(item.id) }}>Supprimer</Button></td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
            <Button onClick={() => {handleAddBtn(category)}}>Ajouter</Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default TemplateRow;