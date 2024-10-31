// src/models/Tender.js
const mongoose = require('mongoose');

// Define the schema for Tender
const tenderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,  // Title is required
  },
  description: {
    type: String,
    required: true,  // Description is required
  },
  type: {
    type: String,
    required: true,  // Type is required
  },
  status: {
    type: String,
    default: 'Active', // Default status is Active
  },
  document: {
    type: String,  // This will store the path to the uploaded document
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Create a model from the schema
const Tender = mongoose.model('Tender', tenderSchema);

// Export the model
module.exports = Tender;