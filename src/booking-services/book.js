const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect("mongodb://mongodb:27017/booking_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

const bookingSchema = new mongoose.Schema({
  user_id: String,
  event_id: String,
  tickets_purchased: Number,
  price: Number,
  payment: Number,
  status: { type: String, default: "CONFIRMED" },
});

const Booking = mongoose.model("Booking", bookingSchema);

let channel;
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq");
    channel = await connection.createChannel();
    await channel.assertQueue("notificationQueue");
    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error("❌ RabbitMQ Connection Failed:", error);
  }
}
connectRabbitMQ();

app.post("/bookings", async (req, res) => {
  try {
    const { user_id, event_id, tickets_purchased, price } = req.body;
    if (!user_id || !event_id || !tickets_purchased || !price) {
      return res.status(400).json({ error: "⚠️ Missing required fields" });
    }

    const payment = tickets_purchased * price;
    const newBooking = new Booking({
      user_id,
      event_id,
      tickets_purchased,
      price,
      payment,
    });

    const saved = await newBooking.save();
    console.log("📢 Booking Created:", saved);

    if (channel) {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(JSON.stringify({ event: "BOOKING_CREATED", data: saved }))
      );
    }

    res.status(201).json({ message: "✅ Booking Created", booking: saved });
  } catch (err) {
    console.error("❌ Error Creating Booking:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "❌ Booking Not Found" });

    res.json(booking);
  } catch (err) {
    console.error("❌ Error Fetching Booking:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/bookings/:userid/getuser", async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.userid });
    res.json(bookings);
  } catch (err) {
    console.error("❌ Error Fetching Bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ error: "⚠️ Status field is required" });

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "❌ Booking Not Found" });

    if (channel) {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(
          JSON.stringify({ event: "BOOKING_STATUS_UPDATED", data: updated })
        )
      );
    }

    res.json({ message: "✅ Booking Status Updated", booking: updated });
  } catch (err) {
    console.error("❌ Error Updating Booking Status:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/bookings/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "❌ Booking Not Found" });

    if (channel) {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(
          JSON.stringify({ event: "BOOKING_CANCELLED", data: deleted })
        )
      );
    }

    res.json({ message: "✅ Booking Cancelled" });
  } catch (err) {
    console.error("❌ Error Deleting Booking:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/bookings/:id/byevent", async (req, res) => {
  try {
    const bookings = await Booking.find({ event_id: req.params.id });
    if (bookings.length === 0)
      return res.status(404).json({ message: "❌ Booking Not Found" });

    await Booking.deleteMany({ event_id: req.params.id });

    if (channel) {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(
          JSON.stringify({ event: "BOOKING_CANCELLED", data: bookings })
        )
      );
    }

    res.json({ message: "✅ Booking Cancelled" });
  } catch (err) {
    console.error("❌ Error Deleting Booking:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () =>
  console.log(`🚀 Booking Service running on port ${PORT}`)
);
