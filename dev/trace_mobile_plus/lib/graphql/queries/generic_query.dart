const String genericQuery = r'''
  query GenericQuery(
    $dbName: String!,
    $value: String!
  ) {
    genericQuery(
      dbName: $dbName,
      value: $value
    )
  }
''';
