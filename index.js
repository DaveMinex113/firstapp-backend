// mkdir web-app && cd web-app
// npm init -y
// npm install express cors dotenv passport passport-google-oauth20 openai mongoose axios

require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  session({ secret: "your_secret_key", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://firstapp-backend-r28m.onrender.com/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this key is set in your .env file
}); 

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    // res.json({
    //     status : "success",
    //     message:"Google Authentication Successful!"
    // })
    res.redirect("http://localhost:3000/chat");
    // res.send("Google Authentication Successful!")
  }
);


app.post("/chat",  async (req, res)=> {
    const message = req.body
    console.log(message);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: message }],
      });
      console.log(response.choices[0].message.content)
  
      res.json({ reply: response.choices[0].message.content });
      console.log("AI Response:", response.choices[0].message.content);
    } catch (error) {
      console.error("Error:", error);
    }
  });
  
  
app.listen(5000, () => console.log("Server running on port 5000"));
