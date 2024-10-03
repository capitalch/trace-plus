import { gql } from "@apollo/client";

export const GET_ALBUMS = gql`
query getAlbums {
  albums {
    data{
      id,
      title,
      user {
        id,
        name,
        username,
        email
      }
    }
  }
}`

export const GET_ALL_TODOS = gql`
{
  allTodos {
    id,
    title,
    status
  }
}
`
// server is /lab/python/fastapi-graphql-03-10-2024
export const GET_HELLO = gql`
query {
    hello
}`

// server is /lab/python/fastapi-graphql-03-10-2024
export const GET_BOOKS = gql`
query {
  books {
    title
    author
  }
}`

export const GET_TEST_EXCEPTION = gql`
query {
  testException
}`