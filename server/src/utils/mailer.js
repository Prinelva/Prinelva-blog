import nodemailer from 'nodemailer';
export function transporter(){
    if(!process.env.SMTP_HOST)
        return null;
    return nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})}
export async function sendMail(to,subject,html){
    const t=transporter();
    if(!t)
        return false;
    await t.sendMail({from:process.env.MAIL_FROM,to,subject,html});
    return true
}
