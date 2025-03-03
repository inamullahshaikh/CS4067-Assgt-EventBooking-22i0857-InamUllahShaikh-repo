const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json()); // Use built-in JSON parser

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/eventsdb")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Event Schema & Model
const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);
const Event = mongoose.model("Event", eventSchema);

// 🎯 Create Event
app.post("/events", async (req, res) => {
  try {
    const { name, date, venue } = req.body;
    const newEvent = new Event({ name, date, venue });
    await newEvent.save();
    res.status(201).json({ message: "✅ Event Created", event: newEvent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📜 Get All Events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get Event by ID (with ID validation)
app.get("/events/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "⚠️ Invalid Event ID" });

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "❌ Event Not Found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Event
app.put("/events/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "⚠️ Invalid Event ID" });

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEvent)
      return res.status(404).json({ message: "❌ Event Not Found" });
    res.json({ message: "✅ Event Updated", event: updatedEvent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Event
app.delete("/events/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "⚠️ Invalid Event ID" });

  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ message: "❌ Event Not Found" });
    res.json({ message: "✅ Event Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Event Service running on port ${PORT}`));
