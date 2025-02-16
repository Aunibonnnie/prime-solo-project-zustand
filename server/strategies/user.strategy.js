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

        if (user && encryptLib.comparePassword(password, user.password)) {
          // The request body's password has been hashed and matches the stored
          // hashed password. AKA: Login was successful! Now, we use Passport's
          // done function to instantiate a new session for this user.
            // The `done` function takes two arguments:
              // * An error. This is `null` in this case.
              // * A user we want to instatiate a session for.
          done(null, user);
        } else {
          // The request body's password has been hashed and DOES NOT match the
          // stored hashed password. AKA: Login was unsuccessful.
          // Calling `done` without an error or user will result in Passport
          // sending back HTTP 401.
          console.log('POST /api/user/login received an invalid login request.');
          done(null, null);
        }
      })
      .catch((dbErr) => {
        console.log('POST /api/user/login error:', dbErr);
        // In this case, something went wrong with the database query. So,
        // now we have an error object that we can feed into the `done` function.
        // This will result in Passport sending back HTTP 500.
        done(dbErr, null);
      });
  })
);


module.exports = passport;

