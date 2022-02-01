/* All logic related to user login/signup/authorization/resetting password and checking 
user roles*/
const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { mailer } = require("./mailer");

// Register a new user
exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  user.save((err, newUser) => {
    if (!newUser)
      return res.status(400).json({ error: "Email address already exists !" });
      //Create a jsonwebtoken 
    const jwtToken = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
    // Send confirmation e-mail using mailer
    mailer.sendMail({
      from: process.env.USER,
      to: req.body.email,
      subject: "Activate your account",
      html: `
      <h2>Hello ${req.body.name},</h2>
      <p style='font-size:1rem;'>Heartiest welcome from <strong>Aeroclub MNNIT</strong>.
      We hope you have an exciting and adrenaline-packed experience throughout your stay with us.
      You're just a step away from completion.</p>
      
      <h4><a href="${process.env.BASE_URL}/user/confirm/${jwtToken}">Click Here</a> to confirm your registration.</h4>
      
      <br/>
      <p class='float-left'>
      Team Aeroclub
      </p>
      <p class='float-left'>
      If you think it's not you, just ignore this email.
      </p>`,
    });
    res
      .status(400)
      .json({ message: "Signedup success...Verify your email address!" });
  });
};


// get token from authorization header and verify it
exports.confirm = (req, res) => {
  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(422).json({ error: err });
    const { _id } = payload;
    User.findById(_id).then((user) => {
      if (user.confirmed)
        return res.json({ error: "User already confirmed !" });

      if (!user) return res.json({ error: "User does not exists !" });
      user.confirmed = true;
      user.save().then((savedUser) => {
        return res.json({ message: "User Confirmed successfully !" });
      });
    });
  });
};
//Login Admin
exports.Adminlogin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "Email or password do not match !",
      });
    }
    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email or password do not match !",
      });
    }
    res.json({ role: user.role, message: "Admin loggedIn successfully !" });
  });
};
//Login user
exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "Email or password do not match !",
      });
    }

    if (!user.confirmed)
      return res.status(400).json({
        error: "You need to verify your email before login !",
      });
    if (!user.canSignIn)
      return res
        .status(401)
        .json({ error: "Your account is temporarily suspended!" });

    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email or password do not match !",
      });
    }
    // create jwt token
    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // put token in cookie
    res.cookie("token", jwtToken, { expire: new Date() + 9999 });
    res.json({ token: jwtToken, message: "LoggedIn Successfully !", user });
  });
};
/*If user forgets password send a mail to registered e-mail address to
reset the password*/
exports.forgetPassword = (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user)
      return res.status(422).json({ error: "Email is not registered !" });
    const jwtToken = jwt.sign({ _id: user._id }, process.env.FORGET_SECRET, {
      expiresIn: "1h",
    });
    user.reset_pass_session = true;
    mailer.sendMail(
      {
        from: process.env.USER,
        to: req.body.email,
        subject: "Password-Reset@aeroclubmnnit",
        html: `<h2>You requested for password reset</h2>
            <p>Click on this <a href="${process.env.BASE_URL}/user/resetpassword/${jwtToken}">link</a> to reset password<p>`,
      })
    res.json({ message: "Checkout your registered email !" });
    user.save();
  });
};
//Verify forget-password jwt token and reset user password
exports.resetPassword = (req, res) => {
  const newPassword = req.body.password;
  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, process.env.FORGET_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Unauthorized or Session expired !' });
    const { _id } = payload;

    User.findById(_id).exec((err, user) => {

      if (!user.reset_pass_session)
        return res
          .status(422)
          .json({ error: 'Unauthorized or Session expired !' });

      user.reset_pass_session = false;
      if (!user) return res.json({ error: "User does not exists !" });
      user.password = newPassword; // requires more protection in future :(
      user
        .save()
        .then((savedUser) => {
          return res.json({ message: "Password updated successfully !" });
        })
        .catch((err) => {
          res.status(401).json({ error: 'Error updating password...try Again !' });
        });
    });
  });
};
//Logoff/Signout user
exports.signout = (req, res) => {
  res.clearCookie("token");//Delete jwt token from cookie
  res.json({
    message: "User signout successfully !",
  });
};

//custom middlewares
exports.isSignedIn = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization)
    return res.status(401).json({ error: "You must be logged in !" });
  const token = authorization.replace("Bearer ", "");

  // verifying jwt token
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: "You must be logged in !" });
    const { _id } = payload;

    // finding the user with the id
    User.findById(_id).exec((err, user) => {
      if (!user)
        return res.status(401).json({ error: "You must be logged in !" });
      if (!user.confirmed)
        return res
          .status(401)
          .json({ error: "You must confirm your account first!" });
      if (!user.canSignIn)
        return res
          .status(401)
          .json({ error: "Your account is temporarily suspended!" });

      req.user = user.transform();
      next();
    });
  });
};

exports.resetVerify = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, process.env.FORGET_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Unauthorized or Session expired !' });

    const { _id } = payload;

    User.findById(_id).exec((err, user) => {

      if (err) return res.json({ error: "User does not exists !" });
      if (!user.reset_pass_session)
        return res
          .status(422)
          .json({ error: 'Unauthorized or Session expired !' });
      res.json({ message: 'Authorized !' })
    });
  });
};
// Check wheter user is an Admin or not
exports.isAdmin = (req, res, next) => {
  if (req.user.role === "User") {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};
