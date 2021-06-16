import React from "react";
import { Route, Switch } from "react-router-dom";
import Box from "@material-ui/core/Box";

const Message = (props) => {
  return <Box>{props.data}</Box>;
};

export default Message;
