const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const secretKey = "GUVI_TASK";
const app = express();
const port = 3000;


// Connect to MongoDB (replace 'mongodb://localhost:27017/demo' with your MongoDB connection string)
mongoose.connect('mongodb://localhost:27017/Guvi_task', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  // db.collection('users').deleteMany({}); //to delete all the fields
  console.log('Connected to MongoDB');
});


// Middleware to parse JSON requests
app.use(bodyParser.json());



app.use(cors());
// Sample MongoDB schema and model
const itemSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  age: Number,
  gender: String,
  dob: Date,
  mobileNumber: Number,
});

// Creating model for the collection
const Item = mongoose.model('Users', itemSchema);

// Middleware for logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// methods

const isTokenExpired = async (token) =>{
    try {
      const decoded = await jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  
      // Check if the token's expiration time (exp) is in the past
      console.log("current time "+currentTime);
      return {time : decoded.exp, ctime: currentTime}
    } catch (error) {
      // Handle verification errors (e.g., invalid signature, expired token)
      console.error(error);
      return true; // Consider token expired in case of errors
    }
  }

// Routes

app.get("/", (req, res)=>{
    res.send("Hello world");
  })
  // POST: Create a new item
  app.post('/signup', async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      const existingItem = await Item.findOne({ email: req.body.email });
      const doc = await Item.find();
  
      if (existingItem) {
        return res.status(409).json({ error: 'Email already exists', query: existingItem, document: doc });
      } else {
        const newItem = await Item.create(req.body);
        res.status(201).json({ item: newItem, req: req.body });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  app.post("/login", async (req, res) => {
    try {
      const user = await Item.findOne({ email: req.body.email });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid email' });
      }
  
      const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: '24h' });
      res.json(token);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  
  })
  
  
  
  app.post("/update", async (req, res) => {
    const token = req.header('Authorization');
    console.log(req.header('Authorization'));
    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        // Token verification failed
        console.error(err);
      } else {
        const userId = decoded.userId;
        // Token verification succeeded, and decoded contains the original payload
        const patchDocument = req.body;
        console.log(userId)
        const updatedUser = await Item.findByIdAndUpdate(userId, patchDocument, { new: true });
  
        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        return res.json(updatedUser);
      }
    });
  })
  
  
  // GET: Retrieve all items
  app.get('/data', async (req, res) => {
    try {
        const token  = req.header("Authorization");
        const user = await jwt.verify(token, secretKey, async(err, decoded)=>{
            const userId = decoded.userId;
            const user = await Item.findOne({ _id: userId });
            console.log(user)
            return user;
        })
        res.send(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post("/auth", async (req, res)=>{
    const token = req.body.token;
    const data = isTokenExpired(token);
    console.log(data)
  })
  
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
  