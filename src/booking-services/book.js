const express = require("express");
const { Pool } = require("pg");
const amqp = require("amqplib");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ PostgreSQL Connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booking_db",
  password: "1234",
  port: 5432,
});

// ✅ RabbitMQ Connection
let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue("notificationQueue");
    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error("❌ RabbitMQ Connection Failed:", error);
  }
}
connectRabbitMQ();

// 🎯 Create Booking
app.post("/bookings", async (req, res) => {
  try {
    const { user_id, event_id, payment } = req.body;
    if (!user_id || !event_id || !payment) {
      return res.status(400).json({ error: "⚠️ Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO bookings (user_id, event_id, payment, status) VALUES ($1, $2, $3, 'PENDING') RETURNING *",
      [user_id, event_id, payment]
    );

    console.log("📢 Booking Created:", result.rows[0]);

    // 🔔 Notify Notification Service
    if (channel) {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(
          JSON.stringify({ event: "BOOKING_CREATED", data: result.rows[0] })
        )
      );
    } else {
      console.error("⚠️ RabbitMQ channel not initialized");
    }

    res
      .status(201)
      .json({ message: "✅ Booking Created", booking: result.rows[0] });
  } catch (err) {
    console.error("❌ Error Creating Booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📜 Get Booking by ID
app.get("/bookings/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "❌ Booking Not Found" });

    console.log("📢 Booking Retrieved:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error Fetching Booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Booking Status
app.put("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "⚠️ Status field is required" });
    }
    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "❌ Booking Not Found" });

    console.log("📢 Booking Status Updated:", result.rows[0]);

    // 🔔 Notify Notification Service
    if (channel) {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(
          JSON.stringify({
            event: "BOOKING_STATUS_UPDATED",
            data: result.rows[0],
          })
        )
      );
    } else {
      console.error("⚠️ RabbitMQ channel not initialized");
    }

    res.json({ message: "✅ Booking Status Updated", booking: result.rows[0] });
  } catch (err) {
    console.error("❌ Error Updating Booking Status:", err);
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete Booking
app.delete("/bookings/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "❌ Booking Not Found" });

    console.log("📢 Booking Cancelled:", result.rows[0]);

    // 🔔 Notify Notification Service
    if (channel) {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(
          JSON.stringify({ event: "BOOKING_CANCELLED", data: result.rows[0] })
        )
      );
    } else {
      console.error("⚠️ RabbitMQ channel not initialized");
    }

    res.json({ message: "✅ Booking Cancelled" });
  } catch (err) {
    console.error("❌ Error Deleting Booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start Server
const PORT = 5001;
app.listen(PORT, () =>
  console.log(`🚀 Booking Service running on port ${PORT}`)
);
