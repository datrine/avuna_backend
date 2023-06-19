import * as nodemailer from "nodemailer";
import Email from "email-templates";
import path from "path";
import * as pug from "pug";
import { config } from "dotenv";
config();
let {SMTP_PASSWORD,SMTP_USERNAME,SMTP_HOST,SMTP_PORT}=process.env
let sendEmail = async ({ recipient, locals, template }) => {
  try {
    console.log({locals})
    let transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    });
    let fnSubject = pug.compileFile(
      path.join(process.cwd(), "email_templates", `${template}`, `subject.pug`)
    );
    let subject = fnSubject(locals);
    let fnHTML = pug.compileFile(
      path.join(process.cwd(), "email_templates", `${template}`, `html.pug`)
    );
    let html = fnHTML(locals);
    transport.sendMail({
      subject,
      html,
      to: recipient,
      from: "trinitietp@gmail.com",
    });
    /*  const email = new Email({
      message: {
        from: "",
      },
      transport,
    });
    await email.send({
      template: `${template}`,
      message: { to: recipient },
      locals,
      
    });*/
  } catch (error) {
    console.log(error);
  }
};
export { sendEmail };
