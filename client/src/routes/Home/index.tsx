import { Col, Row } from "react-bootstrap";
import ClaimSection from "./ClaimSection";
import ConfigurationSection from "./ConfigurationSection";
import ConversationSection from "./ConversationSection";
import InstructionSection from "./InstructionSection";
import TemplateSection from "./TemplateSection";
import { Stack } from '@twilio-paste/core/stack';

export default function Home() {

  return (
    <>
      <Row className="justify-content-md-center">
        <Col lg={10}>
          <Stack orientation="vertical" spacing="space60">
            <ClaimSection />
            <InstructionSection />
            <ConfigurationSection />
            <TemplateSection />
            <ConversationSection />
          </Stack>
        </Col>
      </Row>
    </>
  )

}