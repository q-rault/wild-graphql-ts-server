import mongoose from 'mongoose';
import WilderModel from './models/Wilder';

const { ApolloServer, gql } = require('apollo-server');

// Database
mongoose
  .connect('mongodb://127.0.0.1:27017/wilderdb', {
    autoIndex: true,
  })
  .then(() => console.log('Connected to database')) // eslint-disable-line no-console
  .catch((err) => console.log(err)); // eslint-disable-line no-console

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Wilder {
    _id: ID!
    name: String
    city: String
    skills: [Skill]
  }

  type Skill {
    _id: ID
    title: String
    votes: Int
  }
  input SkillInput {
    title: String
    votes: Int
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getAllWilders: [Wilder]
    getOneWilder(id: ID!): Wilder
  }

  type Mutation {
    createOneWilder(name: String, city: String, skills: [SkillInput]): Wilder
    updateOneWilder(
      id: ID!
      name: String
      city: String
      skills: [SkillInput]
    ): Boolean
    deleteOneWilder(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    getAllWilders: async () => {
      const result = await WilderModel.find();
      return result;
    },
    getOneWilder: async (_, args) => {
      const result = await WilderModel.findById(args.id);
      return result;
    },
  },
  Mutation: {
    createOneWilder: async (_, args) => {
      const wilder = new WilderModel({
        name: args.name,
        city: args.city,
        skills: args.skills,
      });
      const result = await wilder.save();
      return result;
    },
    deleteOneWilder: async (_, args) => {
      // const {id, ...otherProps} = args;
      // const result = await WilderModel.updateOne({ _id: id }, otherProps);
      const result = await WilderModel.deleteOne({ _id: args.id });
      return result.deletedCount > 0;
    },
    updateOneWilder: async (_, args) => {
      const { id, name, city, skills } = args;
      // const result = await WilderModel.updateOne({ _id: id }, otherProps);
      const result = await WilderModel.updateOne(
        { _id: id },
        { name, city, skills }
      );
      return result.modifiedCount > 0;
    },
  },
};

// Start Server
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }: { url: String }) => {
  console.log(`🚀  Server ready at ${url}`);
});
