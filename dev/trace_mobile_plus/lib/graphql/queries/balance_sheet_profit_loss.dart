const String balanceSheetProfitLoss = r'''
  query BalanceSheetProfitLoss(
    $dbName: String!,
    $value: String!
  ) {
    balanceSheetProfitLoss(
      dbName: $dbName,
      value: $value
    )
  }
''';