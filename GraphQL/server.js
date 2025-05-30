
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

// Mock данные
const users = [
  { id: '1', name: 'Alice', email: 'alice@example.com', posts: ['1'] },
  { id: '2', name: 'Bob', email: 'bob@example.com', posts: ['2'] },
];

const posts = [
  { id: '1', title: 'First Post', content: 'Hello World!', authorId: '1' },
  { id: '2', title: 'GraphQL Guide', content: 'Learn GraphQL in 5 mins', authorId: '2' },
];

// Определение схемы GraphQL
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!, authorId: ID!): Post!
  }
`;

// Резолверы для обработки запросов
const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(user => user.id === id),
    posts: () => posts,
  },
  Mutation: {
    createPost: (_, { title, content, authorId }) => {
      const newPost = {
        id: String(posts.length + 1),
        title,
        content,
        authorId,
      };
      posts.push(newPost);
      return newPost;
    },
  },
  Post: {
    author: post => users.find(user => user.id === post.authorId),
  },
  User: {
    posts: user => posts.filter(post => user.posts.includes(post.id)),
  },
};

// Настройка Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();
