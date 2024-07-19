// index.js

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const cors = require('cors');
const config = require('./config'); // Import your config file

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const Users = mongoose.model('Users', {
  username: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  profileimage: {
    type: String,
    default:"",
  },
  imageUrls: {
    type: [String],
    default: [],
  },
  data: {
    type: Date,
    default: Date.now,
  },
});

// Signup API
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user with the same email already exists
    let check = await Users.findOne({ email });
    if (check) {
      return res.status(400).json({ success: false, errors: 'User with the same email already exists!' });
    }

    // Create a new user instance
    const user = new Users({
      username,
      email,
      password,
      imageUrls: [], // Initialize as needed
    });

    // Save the user to the database
    await user.save();

    // Generate JWT token for authentication
    const token = jwt.sign({ user: { id: user.id } }, config.jwtSecret);

    // Respond with success and token
    res.status(200).json({ success: true, token, name: username, });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ success: false, errors: 'Internal server error' });
  }
});

// Login API
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.json({ success: false, errors: 'User not found' });
    }

    const isMatch = password === user.password;
    if (!isMatch) {
      return res.json({ success: false, errors: 'Password is incorrect' });
    }

    const token = jwt.sign({ user: { id: user.id } }, config.jwtSecret);
    res.json({ success: true, token, name: user.username ,id:user._id,profileimage:user.profileimage });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, errors: 'Internal server error' });
  }
});

// Middleware to fetch user based on token
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ errors: 'Please authenticate' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Error in fetchUser middleware:', error);
    res.status(401).send({ errors: 'Please authenticate' });
  }
};

// Example of protected route using middleware
app.get('/profile', fetchUser, (req, res) => {
  res.json({ success: true, user: req.user });
});



// Update Profile Image and Append URL to imageUrls
app.post('/setImageUrls', fetchUser, async (req, res) => {
  try {
    const { files } = req.body;
    console.log(files);

    // Find the user by ID and set the imageUrls array
    const user = await Users.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { imageUrls: files  } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, errors: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error in setImageUrls:', error);
    res.status(500).json({ success: false, errors: 'Internal server error' });
  }
});

// Fetch All Image URLs
app.get('/imageUrls', fetchUser, async (req, res) => {
  try {
    // Find the user by ID and get the imageUrls array
    const user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, errors: 'User not found' });
    }

    res.json({ success: true, imageUrls: user.imageUrls });
  } catch (error) {
    console.error('Error in fetch imageUrls:', error);
    res.status(500).json({ success: false, errors: 'Internal server error' });
  }
});

app.delete('/deleteImageUrl/:url', fetchUser, async (req, res) => {
  try {
    const imageUrlToDelete = req.params.url;

    const user = await Users.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { imageUrls: imageUrlToDelete } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, errors: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error in deleteImageUrl:', error);
    res.status(500).json({ success: false, errors: 'Internal server error' });
  }
});
app.post('/setProfileImageUrl', fetchUser, async (req, res) => {
  try {
    const { selectedUrl} = req.body;

    // Find the user by ID and update the profile image URL
    const user = await Users.findOneAndUpdate(
      { _id: req.user.id },
      { profileimage: selectedUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, errors: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error setting profile image URL:', error);
    res.status(500).json({ success: false, errors: 'Internal server error' });
  }
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
