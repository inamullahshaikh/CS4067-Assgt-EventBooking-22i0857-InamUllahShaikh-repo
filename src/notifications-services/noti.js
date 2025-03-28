const express = require("express");
const { Pool } = require("pg");
const amqp = require("amqplib");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ✅ PostgreSQL Connection (User Service DB)
const pgPool = new Pool({
  user: "postgres",
  host: "postgres",
  database: "user_service_db",
  password: "pass",
  port: 5432,
});

// ✅ MongoDB Connection (Notifications DB)
const mongoClient = new MongoClient("mongodb://mongodb:27017");
let notificationsCollection;
mongoClient.connect().then(() => {
  const db = mongoClient.db("notificationsdb");
  notificationsCollection = db.collection("notifications");
});

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "inamullahshaikh01@gmail.com",
    pass: "zocz kjsr ooeu ppii", // Use your generated app password here
  },
});

// ✅ RabbitMQ Connection
async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://rabbitmq");
  const channel = await connection.createChannel();
  await channel.assertQueue("notificationQueue");

  channel.consume("notificationQueue", async (msg) => {
    try {
      console.log("📩 Received message:", msg.content.toString());

      const parsedMsg = JSON.parse(msg.content.toString());
      const { event, data } = parsedMsg;

      if (!data) {
        console.error("❌ Booking data is missing:", parsedMsg);
        channel.ack(msg);
        return;
      }

      const { id: booking_id, user_id, event_id, status } = data;

      // 🔍 Fetch user email from user_db
      const userResult = await pgPool.query(
        "SELECT email FROM users WHERE id = $1",
        [user_id]
      );
      if (userResult.rows.length === 0) throw new Error("User not found");
      const userEmail = userResult.rows[0].email;

      let message;
      let subject;

      // 🎯 Handle different booking events
      switch (event) {
        case "BOOKING_CREATED":
          subject = "Booking Confirmation";
          message = `Your booking (ID: ${booking_id}) for event ${event_id} is confirmed!`;
          break;
        case "BOOKING_STATUS_UPDATED":
          subject = "Booking Status Updated";
          message = `Your booking (ID: ${booking_id}) status has been updated to: ${status}.`;
          break;
        case "BOOKING_CANCELLED":
          subject = "Booking Cancelled";
          message = `Your booking (ID: ${booking_id}) for event ${event_id} has been cancelled.`;
          break;
        default:
          console.warn("⚠️ Unhandled event:", event);
          channel.ack(msg);
          return;
      }

      // 💾 Store Notification in MongoDB
      await notificationsCollection.insertOne({
        booking_id,
        user_id,
        event_id,
        email: userEmail,
        message,
        timestamp: new Date(),
      });

      // 📧 Send Email Notification
      const mailOptions = {
        from: "inamullahshaikh01@gmail.com",
        to: userEmail,
        subject,
        text: message,
      };
      await transporter.sendMail(mailOptions);

      console.log(`📨 Email sent & notification stored for event: ${event}`);
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Error handling notification:", err.message);
      channel.nack(msg, false, false); // Reject message if there's an error
    }
  });
}
connectRabbitMQ();

// ✅ Start Server
const PORT = 5002;
app.listen(PORT, () =>
  console.log(`🚀 Notification Service running on port ${PORT}`)
);
