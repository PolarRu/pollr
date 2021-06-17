import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import pollSocket from "./PollSocket.js";
import * as ENV from "./env";

import ChatBox from "./Chatbox";

const randomID = Math.floor(Math.random() * 1000000);

const Vote = (props) => {
  let [state, setState] = useState(null);
  const [selected, setSelected] = useState(-1);
  const [graphData, setgraphData] = useState(null);
  // copy to clipboard functionality
  const textAreaRef = useRef(null);
  const history = useHistory();
  const pollId = props.match.params.pollId;

  useEffect(() => {
    if (!props.userId) return;

    if (state === null) {
      const listener = async (type, data) => {
        if (data.pollId != pollId) return;
        console.log("Got event: ", type, data);

        if (type === "subscribe") {
          state = { poll: data, vote: { voted: false, count: data.voteCount } };
          setState({ ...state });
        } else if (type === "joined") {
          state.poll.joined.push(data.userId);
          setState({ ...state });
        } else if (type === "vote_update") {
          state.vote.count++;
          state.poll.responses.push(data.vote);

          const data = await fetch(ENV.API_URL + "/poll/" + pollId);
          const json = await data.json();
          console.log(json);
          setGraphData(json);

          setState({ ...state });
        } else if (type === "voted") {
          state.vote.count++;
          state.vote.voted = true;
          state.poll.responses.push(data.vote);
          setState({ ...state });
        } else if (type === "winner") {
          // route winner page
          alert(`Winner was ${data.winner.option}!`);
        }
      };

      function connect() {
        if (!pollSocket.connected) {
          pollSocket.connect().then(() => {
            pollSocket.addListener(listener);
            // pollSocket.sendEvent('subscribe', {userId:props.userId, pollId:pollId});
            pollSocket.sendEvent("subscribe", {
              userId: props.userId,
              pollId: pollId,
              guest: props.guest,
            });
          });
        } else {
          pollSocket.addListener(listener);
          pollSocket.sendEvent("subscribe", {
            userId: props.userId,
            pollId: pollId,
            guest: props.guest,
          });
        }
      }
      connect();
    }
  }, [props.userId]);

  if (!state) return <h3>Loading...</h3>;

  const pollOptions = state.poll.options.map((opt, i) => {
    return (
      <div>
        <FormControlLabel
          className="optionsLabel"
          key={`optKey${i}`}
          value={`${i}`}
          disabled={state.vote.voted !== false ? true : false}
          control={<Radio />}
          label={opt}
        />
      </div>
    );
  });

  function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand("copy");
    e.target.focus();
  }

  const voteParticipants = [];

  for (let i = 0; i < state.poll.joined.length; i += 1) {
    let found = false;
    for (let j = 0; j < state.poll.responses.length; j++) {
      if (state.poll.responses[j].userId === state.poll.joined[i]) {
        found = true;
        break;
      }
    }

    if (found) {
      // if they have, add div that says so
      voteParticipants.push(
        <div className="participantDiv">{`${state.poll.joined[i]} has voted`}</div>
      );
    } else {
      voteParticipants.push(
        <div className="participantDiv">{`${state.poll.joined[i]}`}</div>
      );
    }
  }

  return (
    <div className="voteContainer">
      <h1>{state.poll.question}</h1>
      <div className="voteRow">
        <Box mb={3}>
          <FormControl component="voteOptionsForm">
            <RadioGroup
              className="votingGroup"
              name="voteRadioGroup"
              onChange={(e) => setSelected(e.target.value)}
            >
              {pollOptions}
            </RadioGroup>
          </FormControl>
        </Box>
        <div className="participantContainer">
          <p>{state.vote.count} votes counted</p>
          <p>Poll participants:</p>
          {voteParticipants}
        </div>
        {props.admin && <div className="linkContainer"></div>}
      </div>
      <div className="buttonDivLogin">
        <span>
          <Button
            onClick={() => {
              pollSocket.sendEvent("vote", {
                userId: props.userId,
                pollId: pollId,
                vote: selected,
                guest: props.guest,
              });
            }}
            // disabled={!validateForm()}
            variant="outlined"
            disabled={state.vote.voted || selected < 0}
          >
            Vote
          </Button>
          <Button
            onClick={() => {
              history.push("/landing");
            }}
          >
            Back to landing
          </Button>
        </span>

        {props.admin && (
          <Button
            onClick={() => {
              pollSocket.sendEvent("close_poll", {
                userId: props.userId,
                pollId: pollId,
              });
              history.push("/landing");
            }}
            // disabled={!validateForm()}
            variant="contained"
          >
            Close Poll
          </Button>
        )}
      </div>
      <ChatBox pollId={pollId} />
    </div>
  );
};

export default Vote;
