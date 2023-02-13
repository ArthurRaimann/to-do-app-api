import sgMail from '@sendgrid/mail';

const sendWelcomeEmail = async (email, name) => {
  try {
    sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
    sgMail.send({
      to: email,
      from: 'araimanndev@gmail.com',
      subject: 'Willkommen bei TO DO OR NOT TO DO',
      html: `<strong>Willkommen ${name},</strong><br/>leg logs und kümmere dich um diene <strong>TO DOs</strong>! <br/>Lass uns wissen, wenn du Hilfe benötigst oder Verbesserungsvorschläge hast.`,
    });
  } catch (error) {
    console.log(error);
  }
};

const sendCancelationEmail = async (email, name) => {
  try {
    sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
    sgMail.send({
      to: email,
      from: 'araimanndev@gmail.com',
      subject: 'Good Bye :´(',
      html: `<strong>Auf Wiedersehen ${name},</strong><br/>schade, dass du uns verlässt. Das Team von <strong>TO DO OR NOT TO DO</strong> wünscht dir alles gute! <br/>Hätten wir etwas anders machen können, damit du bleibst? Bitte teile es uns mit.`,
    });
  } catch (error) {
    console.log(error);
  }
};

export { sendWelcomeEmail, sendCancelationEmail };

// #Mail Sending TEST
// sgMail
//   .send({
//     to: 'araimann25@gmail.com',
//     from: 'araimanndev@gmail.com',
//     subject: 'First Mail',
//     text: 'Nice if it works!',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//   })
//   .then(() => {
//     console.log('Email sent');
//   })
//   .catch((error) => {
//     console.error(error);
//   });
