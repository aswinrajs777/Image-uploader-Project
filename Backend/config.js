// config.js

require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  port: process.env.PORT || 4000,
  mongoURI: process.env.MONGODB_URI || 'mongodb+srv://aswinrajs777:aswin123@cluster0.3xmpwzw.mongodb.net/',
  jwtSecret: process.env.JWT_SECRET || 'image',
};
