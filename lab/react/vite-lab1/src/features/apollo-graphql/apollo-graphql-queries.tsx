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