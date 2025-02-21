const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const encryptLib = require('../modules/encryption');
const pool = require('../modules/pool');

// When a user successfully logs in, this passport method persists
// that user's id into a session.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // First try regular user table
  pool.query('SELECT * FROM "user" WHERE "id" = $1', [id])
    .then((dbRes) => {
      const user = dbRes && dbRes.rows && dbRes.rows[0];
      if (user) {
        delete user.password;
        done(null, user);
      } else {
        // If not found, try guest table
        pool.query('SELECT * FROM "guest_user" WHERE "id" = $1', [id])
          .then((guestRes) => {
            done(null, guestRes.rows[0]);
          })
          .catch((err) => done(err));
      }
    })
    .catch((dbErr) => {
      console.log('Error with query in passport.deserializeUser:', dbErr);
      // done takes an error (we have one) and a user (null in this case)
      // this will result in the server returning a 500 status code
      done(dbErr, null);
    });
});

// Middleware function that does the actual work of validating a login request
// and establishing a session. This function gets called whenever a request
// is made to POST /api/user/login.
passport.use(
  'local',
  new LocalStrategy((username, password, done) => {
    const sqlText = `
      SELECT * FROM "user"
        WHERE username = $1;
    `;
    const sqlValues = [username];

    pool.query(sqlText, sqlValues)
      .then((dbRes) => {
        const user = dbRes && dbRes.rows && dbRes.rows[0];

        if (user) {
          // Check if the account is disabled
          if (user.account_status === 'disabled') {
            console.log('Account is disabled');
            return done(null, null, { message: 'Your account has been disabled' });
          }

          // Validate password
          if (encryptLib.comparePassword(password, user.password)) {
            // If password matches, create a session
            done(null, user);
          } else {
            // Password mismatch
            console.log('Invalid password');
            done(null, null);
          }
        } else {
          // User not found
          console.log('User not found');
          done(null, null);
        }
      })
      .catch((dbErr) => {
        console.log('Database error:', dbErr);
        done(dbErr, null);
      });
  })
);


module.exports = passport;



