## GraphQL
# Schema
type Query {
    genericQuery(value: Generic): Generic
}

scalar Generic

# Query
query {
  genericQuery(value:"sss")
}