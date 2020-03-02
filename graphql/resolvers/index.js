 const bcrypt = require('bcryptjs');

 const Event = require('../../models/event');
 const User = require('../../models/user');

const user = async (userId) => {
  try {
    const thisUser = await User.findById(userId);
    return { ...thisUser._doc, _id: thisUser.id, createdEvents: events.bind(this, thisUser._doc.createdEvents) };
  } catch(err) {
    throw err;
  }
};

const events = async (eventIds) => {
  try {
    const events = await Event.find({_id: {$in: eventIds}});
    return events.map((event) => {
        return { ...event._doc, _id: event.id, date: new Date(event._doc.date).toISOString(), creator: user.bind(this, event.creator) };
    });
  } catch(err) {
    throw err;
  }
};

module.exports = {
    events: async () => {
      try {
        const events = await Event.find();
        return events.map((event) => {
          return {
            ...event._doc,
            _id: event.id,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event._doc.creator)
          };
        });
      } catch(err) {
        throw err;
      }
    },
    createEvent: async (args) => {
      let createdEvent;
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: process.env.MONGO_TEST_USER_ID
      });

      try {
        const res = await event.save();
        createdEvent = {
          ...res._doc,
          _id: res.id,
          creator: user.bind(this, res._doc.creator)
        };

        const creator = await User.findById(process.env.MONGO_TEST_USER_ID);
        if(!creator) {
          throw new Error('User not found.');
        }

        creator.createdEvents.push(event);
        await creator.save();
        return createdEvent;
      } catch(err) {
        throw err;
      }
    },
    createUser: async (args) => {
      try {
        const usr = await User.findOne({ email: args.userInput.email });
        if(usr) {
          throw new Error('User exists already.');
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
        const updatedUser = new User({
          email: args.userInput.email,
          password: hashedPassword.toString()
        });
        const result = await updatedUser.save();
        return { ...result._doc, password: null, _id: result.id };
      } catch(err) {
        throw err;
      }
    }
  };
