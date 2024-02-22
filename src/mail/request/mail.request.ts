export default interface MailRequest {
  from: string;
  to: string;
  subject: string;
  context?: Object;
  template?: string;
  text?: string;
}
