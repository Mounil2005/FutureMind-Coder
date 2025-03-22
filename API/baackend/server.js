const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let siteTimers = {}; // Store the timers on the server

// Root route - Display siteTimers data
app.get("/", (req, res) => {
  res.json(siteTimers); // Send the siteTimers data as JSON
});

// Endpoint to receive data from the extension
app.post("/update-timers", (req, res) => {
  const formattedData = req.body; // Data is in "minutes and seconds" format
  console.log("Received updated timers:", formattedData);
  siteTimers = formattedData; // Store the formatted data
  res.send("Timers updated successfully");
});

// Endpoint to fetch data for the website
app.get("/get-timers", (req, res) => {
  res.json(siteTimers); // Send the formatted data
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});