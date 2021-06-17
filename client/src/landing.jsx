import React, { useEffect } from "react";
import { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { useHistory } from "react-router-dom";
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
      <div key={i} style={{ width: "100%", display: "flex" }}>
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
                tabIndex="-1"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </span>
        )}
      </div>
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
        userId: props.userId,
        pollName,
        optionNames,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Created poll: ", data);
        history.push(`/poll/${data.pollId}`);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  async function logout() {
    await fetch(ENV.API_URL + "/logout", {
      method: "POST",
      credentials: "include",
    });
    history.push("/login");
  }

  return (
    <div id="landingPage">
      <div id="pollCreator">
        <h1>Create Poll</h1>
        <div>
          <Button
            onClick={() => {
              logout();
            }}
          >
            Log Out
          </Button>
        </div>
        <div>
          <Box m={2}>
            <div>
              <TextField
                id="pollname"
                onSubmit={handleSubmit}
                type="text"
                value={pollName}
                onChange={(e) => setPollName(e.target.value)}
                label="Poll Name"
                variant="outlined"
              />
            </div>
          </Box>
          {[optionsArray]}
          <div>
            <Button
              onClick={() => {
                setTotalOptions((totalOptions += 1));
              }}
              variant="outlined"
            >
              +
            </Button>
          </div>
          <Button
            onClick={() => createPoll()}
            disabled={!validateForm()}
            variant="contained"
          >
            Start Poll
          </Button>
        </div>
      </div>
      <PollsHistoryContainer userId={props.userId} />
    </div>
  );
}
