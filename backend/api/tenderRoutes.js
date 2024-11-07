const express = require('express');
const Tender = require('../models/Tender');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Create a new tender
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const { email, title, eligibility, description, type, status, startDate, endDate } = req.body;
    const document = req.file ? req.file.path : ''; // Get the file path

    const newTender = new Tender({
      email,
      title,
      eligibility, 
      description,
      type,
      status,
      startDate,
      endDate,
      document, // Save the document path
    });

    await newTender.save();
    res.status(201).json(newTender); // Respond with the newly created tender
  } catch (error) {
    console.error('Error creating tender:', error);
    res.status(500).json({ message: 'Error creating tender', error });
  }
});

// Fetch all tenders
router.get('/', async (req, res) => {
  try {
    const tenders = await Tender.find(); // Fetch all tenders
    res.status(200).json(tenders); // Respond with the list of tenders
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ message: 'Error fetching tenders', error });
  }
});

// Delete a tender by ID
const {auth , isBidder, isAdmin} = require("../middlewares/auth") ;

router.delete('/:id',auth , isAdmin, async (req, res) => {
  try {
    let { id } = req.params; // Get the ID from the request parameters
    id = id.trim();
    // Find the tender by ID
    const tender = await Tender.findById(id);

    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' }); // Handle case where tender does not exist
    }

    // Check if the logged-in user's email matches the tender's  email
    if (req.user.email !== tender.email) {
      return res.status(403).json({ message: 'You do not have permission to delete this tender' });
    }

    // Delete the tender
    await Tender.findByIdAndDelete(id);
    res.status(200).json({ message: 'Tender deleted successfully' }); // Respond with success message
  } catch (error) {
    console.error('Error deleting tender:', error);
    res.status(500).json({ message: 'Error deleting tender', error });
  }
});

module.exports = router; // Export the router
