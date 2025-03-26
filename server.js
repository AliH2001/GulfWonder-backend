const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();

require('./config/database');
const express = require('express');
const path = require('path'); 

// Auth
const verifyToken = require('./middleware/verify-token');

// Controllers
const testJWTRouter = require('./controllers/test-jwt');
const usersRouter = require('./controllers/users');
const profilesRouter = require('./controllers/profiles');
const bookingsRouter = require('./controllers/bookings');
const placesRouter = require('./controllers/places');


const app = express();
const PORT = process.env.PORT || 2000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/test-jwt', testJWTRouter);
app.use('/users', usersRouter);
app.use('/bookings', bookingsRouter); 
app.use('/places', placesRouter); 
app.use('/profiles', verifyToken, profilesRouter); 

// Serve React build files for frontend routes
// app.use(express.static(path.join(__dirname, 'client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// Start server
app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}!`);
});