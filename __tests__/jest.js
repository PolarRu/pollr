const path = require("path");
const mongoose = require("mongoose");
const request = require("supertest");
const { MONGO_TEST_URI } = require("../env");
const { User, Poll } = require("../models/pollModels.js");
const runServer = require("../server/server.js");

const server = "http://localhost:3000";

describe("db unit tests", () => {
  let closeServer;
  beforeAll(() => {
    return runServer().then((close) => {
      closeServer = close;
    });
  });

  afterAll(() => {
    return closeServer().then(() => {
      return mongoose.connection.close();
    });
  });

  xdescribe("poll", () => {
    beforeEach(() => {
      return Poll.deleteMany();
    });

    it("adds to POLL", () => {
      let originalData;
      let newData;
      return Poll.find()
        .then((data) => (originalData = data))
        .then(() => {
          return Poll.create({
            method: "highestVote",
            question: "why?",
            options: "yes",
            creatorId: 0,
            pollId: "5",
            voteCount: 0,
            joined: [],
            responses: [],
            winner: {
              option: "",
              count: 0,
            },
            active: true,
          });
        })
        .then(() => {
          return Poll.find();
        })
        .then((data) => (newData = data))
        .then((data) => {
          expect(newData.length).toBe(1);
          expect(originalData).not.toEqual(newData);
        });
    });

    it("doesnt add to POLL without all necessary info", () => {
      let originalData;
      let newData;
      return Poll.find()
        .then((data) => (originalData = data))
        .then(() => {
          return Poll.create({
            method: [5],
            question: [5],
            options: [5],
            creatorId: 0,
            // pollId: ,
            voteCount: 0,
            joined: [],
            responses: [],
            winner: {
              option: "",
              count: 0,
            },
            active: true,
          });
        })
        .catch((err) => expect(err).toBeInstanceOf(Error));
    });

    it("doesnt error out when POLL is empty", () => {
      return Poll.find().then((data) => {
        expect(data.length).toBe(0);
      });
    });
  });

  xdescribe("user", () => {
    afterEach(() => {
      return User.deleteMany();
    });

    it("adds to USER", () => {
      let origData;
      let newData;

      return User.find()
        .then((data) => {
          origData = data;

          return User.create({
            username: "alex",
            password: "alx",
            pollCreator: false,
            pollsList: [],
          });
        })
        .then(() => {
          return User.find();
        })
        .then((data) => {
          newData = data;
          expect(newData.length).toBe(1);
          expect(origData).not.toEqual(newData);
        });
    });

    it("doesnt add to USER without all necessary data", () => {
      let origData;
      let newData;

      return User.find()
        .then((data) => {
          origData = data;

          return User.create({
            password: [],
            pollCreator: false,
            pollsList: [],
          });
        })
        .catch((err) => expect(err).toBeInstanceOf(Error));
    });

    it("doesnt error out when USER is empty", () => {
      return User.find().then((data) => {
        expect(data.length).toBe(0);
      });
    });
  });

  describe("Route integration", () => {
    describe("/", () => {
      describe("GET", () => {
        it("responds with 200 status and text/html content type", () => {
          return request(server)
            .get("/")
            .expect("Content-Type", /text\/html/)
            .expect(200);
        });
      });
    });
  });

  describe("sign up", () => {
    describe("/signup", () => {
      beforeEach(() => {
        return User.deleteMany();
      });

      afterEach(() => {
        return User.deleteMany();
      });

      describe("POST", () => {
        const userData = {
          username: "test,",
          password: "testpass",
        };
        it("successfully create a new user", () => {
          return (
            request(server)
              .post("/signup")
              .send(userData)
              .set("Accept", "application/json")
              // .expect('Content-Type', /json/)
              .expect(200)
              .then((res) => {
                return User.findOne({ username: userData.username });
              })
              .then((user) => {
                expect(user).not.toBe(null);
              })
          );
        });
      });
    });
  });

  describe("new poll", () => {
    describe("/poll/", () => {
      let data = {
        pollName: "hello?",
        optionNames: ["a", "b"],
        userId: "r",
      };
      beforeEach(() => {
        return Poll.deleteMany();
      });
      describe("POST", () => {
        it("successfully creates a new poll", () => {
          return request(server)
            .post("/poll/")
            .send(data)
            .set("Accept", "application/json")
            .expect(200)
            .then((res) => {
              return Poll.findOne({ question: data.pollName });
            })
            .then((poll) => {
              expect(poll).not.toBe(null);
            });
        });
      });
    });
  });

  //   describe("Route integration", () => {
  //     describe("/login", () => {
  //       describe("GET", () => {
  //         it("responds with 200 status and text/html content type", () => {
  //           return request(server)
  //             .get("/")
  //             .expect("Content-Type", /text\/html/)
  //             .expect(200);
  //         });
  //       });
  //     });
  //   });
});
