/**
 * Email Notification Service
 * Uses Nodemailer to send booking confirmation emails
 */

import nodemailer from 'nodemailer';
import { RestaurantOption } from '../types';

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter
 */
export function initMailer(): void {
  if (transporter) {
    return;
  }

  // Create transporter using SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  console.log('✅ Email service initialized');
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  email: string,
  restaurant: RestaurantOption,
  userContact: { name: string; phone?: string }
): Promise<boolean> {
  if (!transporter) {
    initMailer();
  }

  if (!transporter) {
    console.error('Email transporter not initialized');
    return false;
  }

  const dateTime = new Date(restaurant.dateTime);
  const formattedDate = dateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = dateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@reservationagent.com',
    to: email,
    subject: `Reservation Confirmed: ${restaurant.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Reservation Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${userContact.name},</p>
              <p>Your reservation has been confirmed!</p>
              
              <div class="details">
                <h2>${restaurant.name}</h2>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Party Size:</strong> ${restaurant.partySize} ${restaurant.partySize === 1 ? 'guest' : 'guests'}</p>
                <p><strong>Location:</strong> ${restaurant.location}</p>
                ${restaurant.cuisine ? `<p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>` : ''}
                ${restaurant.rating ? `<p><strong>Rating:</strong> ⭐ ${restaurant.rating}/5</p>` : ''}
                ${restaurant.platform ? `<p><strong>Platform:</strong> ${restaurant.platform}</p>` : ''}
              </div>
              
              ${restaurant.bookingLink ? `<p><a href="${restaurant.bookingLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Reservation Details</a></p>` : ''}
              
              <p>Thank you for using our reservation service!</p>
            </div>
            <div class="footer">
              <p>This is an automated confirmation email. Please contact the restaurant directly for any changes.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Reservation Confirmed: ${restaurant.name}
      
      Hi ${userContact.name},
      
      Your reservation has been confirmed!
      
      Restaurant: ${restaurant.name}
      Date: ${formattedDate}
      Time: ${formattedTime}
      Party Size: ${restaurant.partySize} ${restaurant.partySize === 1 ? 'guest' : 'guests'}
      Location: ${restaurant.location}
      ${restaurant.cuisine ? `Cuisine: ${restaurant.cuisine}\n` : ''}
      ${restaurant.rating ? `Rating: ${restaurant.rating}/5\n` : ''}
      
      Thank you for using our reservation service!
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}


