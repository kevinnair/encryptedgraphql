const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
const {
  buildSchema,

 } = require('graphql');

const app = express();

const events = ['one default event', 'another default event'];

app.use(bodyParser.json());

app.use('/graphql', graphQLHttp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float
      date: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return events;
    },
    createEvent: (args) => {
      const event = {
        _id: Math.random().toString(),
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date().toISOString()
      };

      events.push(event);
      return events;
    }
  },
  graphiql: true
}));



app.listen(3009);