// index.js

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const cors = require('cors');
const config = require('./config'); 

const app = express();
app.use(express.json());
app.use(cors());

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

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let check = await Users.findOne({ email });
    if (check) {
      return res.status(400).json({ success: false, errors: 'User with the same email already exists!' });
    }

    const user = new Users({
      username,
      email,
      password,
      imageUrls: [], 
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id } }, config.jwtSecret);
    res.status(200).json({ success: true, token, name: username, });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ success: false, errors: 'Internal server error' });
  }
});

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

app.get('/profile', fetchUser, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/setImageUrls', fetchUser, async (req, res) => {
  try {
    const { files } = req.body;
    console.log(files);

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

app.get('/imageUrls', fetchUser, async (req, res) => {
  try {
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

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
