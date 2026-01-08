const String trialBalance = r'''
  query TrialBalance(
    $dbName: String!,
    $value: String!
  ) {
    trialBalance(
      dbName: $dbName,
      value: $value
    )
  }
''';