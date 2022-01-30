//Importing npm modules
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const compression = require("compression");

app.use(cors());
app.use(compression());
app.use(express.static(__dirname + "/public"));
app.use("/images", express.static("/public/images"));

// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

//My routes
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");
const componentRoutes = require("./routes/component");
const issueRoutes = require("./routes/issue");
const userRoutes = require("./routes/user");
const projectRoutes = require("./routes/project");
const newsRoutes = require("./routes/news");
const workshopRoutes = require("./routes/workshop");
const photoRoutes = require("./routes/astrophotography");
const achievementRoutes = require("./routes/achievement");
const contactRouters = require("./routes/contact");
const tagRouters = require("./routes/tag");
const shareRouter = require("./routes/shareProj");

// App specific
app.use(express.json());

// Adding routes to the app
app.use("/api", authRoutes);
app.use("/api", blogRoutes);
app.use("/api", componentRoutes);
app.use("/api", issueRoutes);
app.use("/api", projectRoutes);
app.use("/api", newsRoutes);
app.use("/api", userRoutes);
app.use("/api", workshopRoutes);
app.use("/api", photoRoutes);
app.use("/api", achievementRoutes);
app.use("/api", contactRouters);
app.use("/api", tagRouters);
app.use("/api", shareRouter);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.static("client/build"));

// If any invalid route is accessed
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

// PORT
const port = process.env.PORT || 9500;

// Staring the server
app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
