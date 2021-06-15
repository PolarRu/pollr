const path = require('path');
const mongoose = require("mongoose");
const { MONGO_URI } = require('../env');
const { ExpansionPanelActions } = require('@material-ui/core');



describe('db unit tests', () => {
    beforeAll((done) => {
        return mongoose
        .connect(MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          // sets the name of the DB that our collections are part of
          dbName: "Pollr",
        })
        .then( () => {
            console.log("Connected to Mongo DB.");
        })
        .catch((err) => console.log(err));
    });
  
    afterAll((done) => {
      return mongoose.close();
    });

    describe('#sync', () => {
        it('adds to db', () => {
          //data = models.find({})
         // models.add(ANYTHING)
          data1 = models.find({})
          expect(data1).toEqual(data)
        });



};
