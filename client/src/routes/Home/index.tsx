import { Col, Row } from "react-bootstrap";
import ClaimSection from "./ClaimSection";
import ConfigurationSection from "./ConfigurationSection";
import ConversationSection from "./ConversationSection";
import InstructionSection from "./InstructionSection";
import TemplateSection from "./TemplateSection";

export default function Home() {

  return (
    <>
      <Row className="justify-content-md-center">
        <Col lg={10}>
          <ClaimSection />
          <InstructionSection />
          <ConfigurationSection />
          <TemplateSection />
          <ConversationSection />
        </Col>
      </Row>
    </>
  )

}