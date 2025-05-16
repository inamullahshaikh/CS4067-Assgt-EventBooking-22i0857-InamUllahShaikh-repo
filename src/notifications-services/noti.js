const express = require("express");
const amqp = require("amqplib");
const nodemailer = require("nodemailer");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "inamullahshaikh01@gmail.com",
    pass: "uaao bsoq dsei xfej", // Use your generated app password here
  },
});

// ✅ MongoDB Collections
let usersCollection;
let notificationsCollection;

async function startApp() {
  try {
    const mongoClient = new MongoClient("mongodb://mongo:27017");
    await mongoClient.connect();

    const userDb = mongoClient.db("user_service_db");
    usersCollection = userDb.collection("users");

    const notificationsDb = mongoClient.db("notificationsdb");
    notificationsCollection = notificationsDb.collection("notifications");

    console.log("✅ Connected to MongoDB");

    await connectRabbitMQ();

    // ✅ Start Server
    const PORT = 5002;
    app.listen(PORT, () =>
      console.log(`🚀 Notification Service running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start app:", err.message);
  }
}

// ✅ RabbitMQ Connection
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue("notificationQueue");
    console.log("✅ Connected to RabbitMQ");

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

        // 🔍 Fetch user email from MongoDB
        const user = await usersCollection.findOne({
          _id: new ObjectId(user_id),
        });
        if (!user) throw new Error("User not found");
        const userEmail = user.email;

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
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error("❌ RabbitMQ Connection Failed:", error.message);
  }
}

startApp();

// ✅ Start Server
const PORT = 5003;
app.listen(PORT, () =>
  console.log(`🚀 Notification Service running on port ${PORT}`)
);
