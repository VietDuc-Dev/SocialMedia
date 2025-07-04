import { Resend } from "resend";
import { config } from "./app.config";

const resend = new Resend(config.RESEND_API_KEY);

export default resend;
