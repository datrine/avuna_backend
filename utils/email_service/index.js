import * as nodemailer from "nodemailer";
import Email from "email-templates";
import path from "path";
import * as pug from "pug";

let sendEmail = async ({ recipient, locals, template }) => {
  try {
    console.log({locals})
    let transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "c27f8c18b9223e",
        pass: "78a1affa8d1c3b",
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
      from: "test@gmail.com",
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
