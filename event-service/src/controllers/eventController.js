const express = require("express");
const router = express.Router();
const eventService = require("../services/eventService");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create event
router.post("/", async (req, res) => {
  try {
    const newEvent = await eventService.createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update available seats
router.patch("/:id/book", async (req, res) => {
  try {
    const { seats } = req.body;
    const updatedEvent = await eventService.updateEventSeats(
      req.params.id,
      seats
    );
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
