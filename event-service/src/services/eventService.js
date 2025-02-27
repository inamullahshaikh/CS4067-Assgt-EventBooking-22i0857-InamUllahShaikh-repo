const Event = require("../models/event");

const getAllEvents = async () => {
  return await Event.find();
};

const getEventById = async (eventId) => {
  return await Event.findById(eventId);
};

const createEvent = async (eventData) => {
  const newEvent = new Event(eventData);
  return await newEvent.save();
};

const updateEventSeats = async (eventId, seatsToBook) => {
  return await Event.findByIdAndUpdate(
    eventId,
    { $inc: { availableSeats: -seatsToBook } },
    { new: true }
  );
};

module.exports = { getAllEvents, getEventById, createEvent, updateEventSeats };
