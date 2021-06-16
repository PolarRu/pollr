const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const WSServer = require("./websocket.js");
const connections = require("./routers/pollWebsocket.js"); // call this to setup the websocket routes
const SocketIo = require("./io");

const {
  cookieController,
  userController,
  sessionController,
} = require("./controllers");

const { MONGO_URI, MONGO_TEST_URI, NODE_ENV } = require("./env");
const PORT = 3001;

const app = express();

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/login", sessionController.isLoggedIn, (req, res) => {
  if (res.locals.isLoggedIn) {
    res.status(200).json({ tabs: "/landing", userId: res.locals.userId });
  } else res.status(200).json({ tabs: "/login" });
});

// --- Authentication ---
app.post(
  "/signup",
  userController.createUser,
  cookieController.createCookie,
  sessionController.createSession,
  (req, res) => {
    console.log("end of signup route");
    //response includes 'home' to direct frontend to homepage
    res.status(200).json({ tabs: "/landing", userId: res.locals.userId });
  }
);

app.post(
  "/login",
  userController.verifyUser,
  cookieController.createCookie,
  sessionController.createSession,
  (req, res) => {
    if (res.locals.verified) {
      //redirect user in verifUser here
      res.status(200).json({ tabs: "/landing", userId: res.locals.userId });
    } else {
      res.status(200).redirect("/logout");
    }
  }
);

app.post(
  "/logout",
  sessionController.deleteSession,
  cookieController.deleteCookie,
  (req, res) => {
    try {
      return res.status(200).redirect("/");
    } catch (err) {
      res.status(200).json({ tabs: "/logout", message: "error in logout" });
    }
  }
);

// app.get("/guest", (req, res) => {
//   return res
//     .status(200)
//     .json({ tabs: "poll", pollId: req.body.id, userId: "guest123" });
// });

// Routers
const pollRouter = require("./routers/poll.js");
app.use("/poll", pollRouter);

/**
 * 404 handler
 */
app.use("*", (req, res) => {
  res.status(404).send("Not Found");
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.log("ERROR from global error handler", err.log);
  res.status(err.status || 500).send(err.message);
});

const runServer = async () => {
  console.log("environment:", NODE_ENV);
  await mongoose.connect(
    NODE_ENV === "development" ? MONGO_TEST_URI : MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
  SocketIo.init(server);
  SocketIo.start();

  return async () => {
    server.close();
    return WSServer.socket.close();
    // return new Promise(resolve => WSServer.socket.close(() => {
    //   console.log('closing websockets')
    //   resolve();
    // }));
  };
};

module.exports = runServer;
