import React, { useEffect } from "react";
import { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { Redirect, useHistory } from "react-router-dom";
import PollsHistoryContainer from "./pollshistorycontainer.jsx";
import * as ENV from "./env";

/*
Landing page accessible only to logged in user
Contains poll creation options
*Stretch Goal: view past poll history
*/

export default function Landing(props) {
  // poll title
  const [pollName, setPollName] = useState("");
  // total number of poll candidates
  let [totalOptions, setTotalOptions] = useState(2);
  // names of poll candidates
  let [optionNames, setOptionNames] = useState([]);
  // redirect
  const [redirect, setRedirect] = useState(null);

  const history = useHistory();

  // validate that at least two poll candidates exist
  function validateForm() {
    let validCandidates = 0;
    optionNames.forEach((e) => {
      if (e !== null || e !== undefined || e !== "") validCandidates += 1;
    });
    return validCandidates >= 2;
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  const optionsArray = [];

  for (let i = 0; i < totalOptions; i += 1) {
    // create delete icon for all options if there are more than 2 options
    let deleteIcon = totalOptions > 2 ? true : false;
    optionsArray.push(
      <Box m={2}>
        <div className="options">
        <span>
          <TextField
            key={`OptionText${i}`}
            type="text"
            value={optionNames[`${i}`]}
            onChange={(e) => {
              let newOptions = [...optionNames];
              newOptions[`${i}`] = e.target.value;
              setOptionNames(newOptions);
            }}
            label={`Option ${i + 1}`}
            variant="outlined"
          />
          </span>
          </div>
        {deleteIcon && (
          <span>
            <Tooltip title="Delete Poll Option">
              <IconButton
                aria-label="delete"
                onClick={() => {
                  let newOptions = [...optionNames];
                  newOptions.splice(`${i}`, 1);
                  setTotalOptions((totalOptions -= 1));
                  setOptionNames(newOptions);
                }}
                // remove delete icon from tab selection cycle
                tabindex="-1"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </span>
        )}
      </Box>
    );
  }

  const createPoll = () => {
    // fetch request to the server on the 'poll' route, method is post, body: pollName, optionsNames, userId
    fetch(ENV.API_URL + "/poll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: props.location.state.userId,
        pollName,
        optionNames,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Created poll: ", data);
        setRedirect(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  if (redirect)
    return (
      <Redirect
        to={{
          pathname: "/vote",
          state: {
            userId: props.location.state.userId,
            pollId: redirect.pollId,
            pollLink: redirect.link,
            admin: redirect.admin,
            guest: false,
          },
        }}
      />
    );

  async function logout() {
    await fetch(ENV.API_URL + "/logout", {
      method: "POST",
      credentials: "include",
    });
    history.push("/");
  }

  return (
    <div id="landingPage">
      <div id="pollCreator">
        <h1>Create Poll</h1>
        {/* <div>
          <Button
            onClick={() => {
              logout();
            }}
          >
            Log Out
          </Button>
        </div> */}
        <form>
          <Box m={2}>
            <div className="pollOption">
              <TextField
                id="pollname"
                onSubmit={handleSubmit}
                type="text"
                value={pollName}
                onChange={(e) => setPollName(e.target.value)}
                label="Poll Name"
                variant="outlined"/>
            </div>
          </Box>
          {[optionsArray]}
          <div className="add">
            <Button
              onClick={() => {
                setTotalOptions((totalOptions += 1));
              }}
              variant="outlined"
            >
              <b>+</b>
            </Button>
          </div>
          <div className="startPoll">
          <Button
            
            onClick={() => createPoll()}
            disabled={!validateForm()}
            variant="contained"
          >
             <b>Start Poll</b> 
          </Button>
          </div>
          <div className="logout">
          <Button
            onClick={() => {
              logout();
            }}
          >
            <b>Log Out</b>
          </Button>
        </div>
        </form>
      </div>
      <PollsHistoryContainer userId={props.location.state.userId} />
    </div>
    
  );
}
