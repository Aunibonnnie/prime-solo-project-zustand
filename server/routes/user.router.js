const express = require('express');
const encryptLib = require('../modules/encryption');
const pool = require('../modules/pool');
const userStrategy = require('../strategies/user.strategy');
const crypto = require('crypto');


const router = express.Router();

// If the request came from an authenticated user, this route
// sends back an object containing that user's information.
// Otherwise, it sends back an empty object to indicate there
// is not an active session.
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.send({});
  }
});

// Handles the logic for creating a new user. The one extra wrinkle here is
// that we hash the password before inserting it into the database.
router.post('/register', (req, res, next) => {
  const username = req.body.username;
  const hashedPassword = encryptLib.encryptPassword(req.body.password);

  const sqlText = `
    INSERT INTO "user"
      ("username", "password")
      VALUES
      ($1, $2);
  `;
  const sqlValues = [username, hashedPassword];

  pool.query(sqlText, sqlValues)
    .then(() => {
      res.sendStatus(201)
    })
    .catch((dbErr) => {
      console.log('POST /api/user/register error: ', dbErr);
      res.sendStatus(500);
    });
});

// Handles the logic for logging in a user. When this route receives
// a request, it runs a middleware function that leverages the Passport
// library to instantiate a session if the request body's username and
// password are correct.
  // You can find this middleware function in /server/strategies/user.strategy.js.
router.post('/login', userStrategy.authenticate('local'), (req, res) => {
  res.sendStatus(200);
});

router.post('/guest', async (req, res) => {
  const animals = ['panda', 'monkey', 'tiger', 'elephant', 'giraffe', 'penguin', 'koala', 'zebra'];
  let guestUser = null;

  while (!guestUser) {
    try {
      const animal = animals[Math.floor(Math.random() * animals.length)];
      const number = Math.floor(Math.random() * 900000) + 100000;
      const username = `${animal}${number}`;

      const result = await pool.query(
        'INSERT INTO "guest_user" ("username") VALUES ($1) RETURNING *',
        [username]
      );
      guestUser = result.rows[0];
    } catch (error) {
      if (error.code !== '23505') { // If error is not a duplicate key error
        console.error('Guest login error:', error);
        return res.sendStatus(500);
      }
      // If duplicate username, loop will continue and try again
    }
  }

  // Auto-login the guest user after creation
  req.login(guestUser, (err) => {
    if (err) {
      console.error('Error logging in guest:', err);
      return res.sendStatus(500);
    }
    res.send(guestUser);
  });
});

// Clear all server session information about this user:
router.post('/logout', (req, res, next) => {
  // Use passport's built-in method to log out the user.
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.sendStatus(200);
  });
});


module.exports = router;
