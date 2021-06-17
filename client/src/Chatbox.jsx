import React, { useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Message from "./Message";
import * as ENV from "./env";

import io from "socket.io-client";

const Chatbox = (props) => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const ioRef = useRef(null);

  useEffect(() => {
    const socket = io(ENV.API_URL);
    ioRef.current = socket;

    socket.emit("joinPoll", props.pollId || 1);

    socket.on("message", (data) => {
      setAllMessages((prev) => [...prev, data]);
      setMessage("");
    });

    return () => {
      socket.close();
    };
  }, []);

  const onClick = () => {
    if (ioRef.current) {
      ioRef.current.emit("message", { pollId: props.pollId || 1, message });
    }
  };

  const messages = [];
  for (let i = 0; i < allMessages.length; i++) {
    messages.push(<Message data={allMessages[i]} key={i} />);
  }

  return (
    <div >
      <div className= "pollLink">{`Poll Link:   http://localhost:3000/poll/${
        props.pollId || 1
        }`}</div>
      <div id="chatBox">
        <div className="messages">
      <Box>{messages}</Box>
      </div>
      <TextField
        id={"inputText"}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></TextField>
      <div className="sendMessage">
      <Button
        onClick={() => {
          onClick();
        }}
      >
          send message
      </Button>
        </div>
        </div>
    </div>
  );
};

export default Chatbox;
