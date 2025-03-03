const express = require("express");
const { Pool } = require("pg");
const amqp = require("amqplib");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ✅ PostgreSQL Connection (Booking DB)
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booking_db",
  password: "1234",
  port: 5432,
});

// ✅ MongoDB Connection (Notifications DB)
const mongoClient = new MongoClient("mongodb://localhost:27017");
let notificationsCollection;
mongoClient.connect().then(() => {
  const db = mongoClient.db("notificationsdb");
  notificationsCollection = db.collection("notifications");
});

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "devopsdummyfor@gmail.com",
    pass: "bababoi8N",
  },
});

// ✅ RabbitMQ Connection
async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue("notificationQueue");

  channel.consume("notificationQueue", async (msg) => {
    const { type, booking } = JSON.parse(msg.content.toString());
    const { id: booking_id, user_id, event_id } = booking;

    try {
      // 🔍 Fetch user email from user_db
      const userResult = await pgPool.query(
        "SELECT email FROM users WHERE id = $1",
        [user_id]
      );
      if (userResult.rows.length === 0) throw new Error("User not found");
      const userEmail = userResult.rows[0].email;

      // 📧 Send Email
      const mailOptions = {
        from: "devopsdummyfor@gmail.com",
        to: userEmail,
        subject: "Booking Confirmation",
        text: `Your booking (ID: ${booking_id}) for event ${event_id} is confirmed!`,
      };
      await transporter.sendMail(mailOptions);

      // 💾 Store Notification in MongoDB
      await notificationsCollection.insertOne({
        booking_id,
        user_id,
        event_id,
        email: userEmail,
        message: `Booking confirmed for event ${event_id}`,
        timestamp: new Date(),
      });

      console.log("📨 Email sent & notification stored!");
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Error handling notification:", err.message);
    }
  });
}
connectRabbitMQ();

// ✅ Start Server
const PORT = 5002;
app.listen(PORT, () =>
  console.log(`🚀 Notification Service running on port ${PORT}`)
);
