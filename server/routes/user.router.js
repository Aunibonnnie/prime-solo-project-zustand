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

//////////////////////////////////////////
// Update Username
router.put('/change-username', async (req, res) => {
  const { userId, newUsername } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "user" 
       SET username = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING username`,
      [newUsername, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Username updated', username: result.rows[0].username });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username already taken' });
    }
    res.status(500).json({ message: 'Server error', error });
  }
});
//////////////////////////////////////////
////////
// user.router.js
// Route for disabling a user account
router.post('/disable', (req, res) => {
  const { userId } = req.body; // Get userId from the request body
  console.log('Disabling account for user ID:', userId);

  // SQL query to disable the user account
  const sqlText = `
  UPDATE "user"
  SET "status" = FALSE, "account_status" = FALSE, "updated_at" = now()
  WHERE "id" = $1
  RETURNING *;
`;
  const sqlValues = [userId];  // Use the userId from the request body

  pool.query(sqlText, sqlValues)
    .then((dbRes) => {
      if (dbRes.rows.length > 0) {
        console.log('User disabled successfully:', dbRes.rows[0]);
        res.status(200).send({ message: 'Account disabled successfully' });
      } else {
        console.log('No rows updated. User might not exist or already disabled.');
        res.status(404).send({ message: 'User not found or already disabled' });
      }
    })
    .catch((err) => {
      console.error('Error disabling account:', err);
      res.status(500).send({ error: 'Failed to disable account' });
    });
});
////////
///////////////////
//LEADERBOARD
// Route to fetch current user's score
router.get('/score/current-user', async (req, res) => {
  const userId = req.user.id;  // Assuming user is authenticated and `user.id` is available
  const query = `
    SELECT 
      COALESCE(u.username, g.username) AS username,
      SUM(gs.points) AS color_score
    FROM 
      game_score gs
    LEFT JOIN 
      "user" u ON gs.user_id = u.id
    LEFT JOIN 
      "guest_user" g ON gs.guest_user_id = g.id
    WHERE 
      gs.game_type = 'color'  
      AND gs.score_visible = TRUE
      AND gs.user_id = $1  -- Filter by current user
    GROUP BY 
      COALESCE(u.username, g.username)
  `;
  
  try {
    const result = await pool.query(query, [userId]);
    res.json(result.rows[0]);  // Return the user's score
  } catch (error) {
    console.error('Error fetching user score:', error);
    res.status(500).send('Internal Server Error');
  }
});
///////////////////


// Handles the logic for logging in a user. When this route receives
// a request, it runs a middleware function that leverages the Passport
// library to instantiate a session if the request body's username and
// password are correct.
// You can find this middleware function in /server/strategies/user.strategy.js.
  router.post('/login', userStrategy.authenticate('local'), async (req, res) => {
    try {
      const userId = req.user?.id;
  
      if (userId) {
        await pool.query(`UPDATE "user" SET status = TRUE WHERE id = $1`, [userId]);
        console.log(`User ${userId} status set to active`);
      }
  
      res.sendStatus(200);
    } catch (error) {
      console.error('Error updating user status during login:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

router.post('/guest', async (req, res) => {
  const animals = ['Panda', 'Monkey', 'Tiger', 'Elephant', 'Giraffe', 'Penguin', 'Koala', 'Zebra'];
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

router.post('/logout', async (req, res) => {
  try {
    const userId = req.user?.id; // Get logged-in user ID

    if (!userId) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    // Update user status to inactive in SQL database
    await pool.query(`UPDATE "user" SET status = FALSE WHERE id = $1`, [userId]);
    console.log(`User ${userId} status set to inactive`);

    // Log out and clear session
    req.logout(() => {
      console.log(`User ${userId} logged out`);
      res.sendStatus(200);
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
});

// **Fetch User Scores for Account Page**
// Fetch user scores
router.get('/user-scores/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
      const query = `
          SELECT 
              SUM(CASE WHEN game_type = 'color' THEN points ELSE 0 END) AS color_score,
              SUM(CASE WHEN game_type = 'shape' THEN points ELSE 0 END) AS shape_score
          FROM game_score 
          WHERE user_id = $1
          GROUP BY user_id;
      `;

      const result = await pool.query(query, [user_id]);

      if (result.rows.length === 0) {
          return res.json({ success: true, data: { color_score: 0, shape_score: 0 } });
      }

      res.json({ success: true, data: result.rows[0] });
  } catch (error) {
      console.error('Error fetching user scores:', error);
      res.status(500).json({ success: false, error: 'Database error' });
  }
});

module.exports = router;
