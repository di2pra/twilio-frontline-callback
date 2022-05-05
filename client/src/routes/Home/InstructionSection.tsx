import { Card } from '@twilio-paste/core/card';
import { Heading } from '@twilio-paste/core/heading';
import { Paragraph } from '@twilio-paste/core/paragraph';

const InstructionSection = () => {
  return (
    <Card>
      <Heading as="h2" variant="heading20">Instructions</Heading>
      <Paragraph>Démo Frontline connectée à un CRM (Hubspot) avec support de SMS, Voice, WhatsApp sur un numéro français. Ceci est l'interface de configuration de l'application de démo Frontline.</Paragraph>
      <Heading as="h5" variant="heading50">Voice les numéros de téléphone :</Heading>
      <ul>
        <li>SMS : <code>+33 6 44 64 86 41</code></li>
        <li>Voice : <code>+33 6 44 64 86 41</code></li>
        <li>WhatsApp : <code>+33 6 44 64 86 41</code></li>
      </ul>
      <Heading as="h5" variant="heading50">Les liens :</Heading>
      <ul>
        <li><b>Frontline:</b> <a href="https://frontline.twilio.com" rel="noreferrer" target={"_blank"}>https://frontline.twilio.com</a> ; workspace : <code>frontline-se-france</code> ; Compte Manager Frontline : Username <code>se-france@twilio.com</code> / Password : <code>FrontlineManager</code></li>
        <li><b>Hubspot:</b> <a href="https://app.hubspot.com/login/sso" rel="noreferrer" target={"_blank"}>https://app.hubspot.com/login/sso</a></li>
        <li><b>Flex:</b> <a href="https://flex.twilio.com/cadet-manatee-3328" rel="noreferrer" target={"_blank"}>https://flex.twilio.com/cadet-manatee-3328</a></li>
      </ul>
      <Heading as="h5" variant="heading50">Principe de fonctionnement :</Heading>
      <Paragraph>Un serveur vocal accueille les appels entrants avec personnalisation du nom du client. Pour les appels entrants, vous recevrez les appels des contacts dont vous êtes le propriétaire dans Hubspot. Si un numéro n’est pas identifiable dans Hubspot alors l’appel est redirigé vers le Contact Center. De même si un appel entrant est rejeté par l’utilisateur Frontline, alors l’appel est redirigé vers le Contact Center.</Paragraph>
      <Heading as="h5" variant="heading50">Liste des Contacts :</Heading>
      <Paragraph>La liste des contacts dans Frontline est synchronisée avec le CRM Hubspot. Vous devez être propriétaire d’un contact dans Hubspot pour qu’il apparaisse dans Frontline.</Paragraph>
    </Card>
  )
}

export default InstructionSection;