class BusinessHealthModel {
  final double sundryCreditors;
  final double sundryDebtors;
  final double bankAccounts;
  final double cashInHand;
  final double purchaseAccount;
  final double salesAccount;
  final double openingStock;
  final double openingStockGst;
  final double closingStock;
  final double closingStockGst;
  final double profitLoss;
  final double differenceInStock;
  final double differenceInStockGst;
  final double businessIndex;

  BusinessHealthModel({
    required this.sundryCreditors,
    required this.sundryDebtors,
    required this.bankAccounts,
    required this.cashInHand,
    required this.purchaseAccount,
    required this.salesAccount,
    required this.openingStock,
    required this.openingStockGst,
    required this.closingStock,
    required this.closingStockGst,
    required this.profitLoss,
    required this.differenceInStock,
    required this.differenceInStockGst,
    required this.businessIndex,
  });

  // Formatted getters with "L" suffix for display
  String get sundryCreditorsFormatted => '${sundryCreditors.toStringAsFixed(2)} L';
  String get sundryDebtorsFormatted => '${sundryDebtors.toStringAsFixed(2)} L';
  String get bankAccountsFormatted => '${bankAccounts.toStringAsFixed(2)} L';
  String get cashInHandFormatted => '${cashInHand.toStringAsFixed(2)} L';
  String get purchaseAccountFormatted => '${purchaseAccount.toStringAsFixed(2)} L';
  String get salesAccountFormatted => '${salesAccount.toStringAsFixed(2)} L';
  String get openingStockFormatted => '${openingStock.toStringAsFixed(2)} L';
  String get openingStockGstFormatted => '${openingStockGst.toStringAsFixed(2)} L';
  String get closingStockFormatted => '${closingStock.toStringAsFixed(2)} L';
  String get closingStockGstFormatted => '${closingStockGst.toStringAsFixed(2)} L';
  String get profitLossFormatted => '${profitLoss.toStringAsFixed(2)} L';
  String get differenceInStockFormatted => '${differenceInStock.toStringAsFixed(2)} L';
  String get differenceInStockGstFormatted => '${differenceInStockGst.toStringAsFixed(2)} L';
  String get businessIndexFormatted => '${businessIndex.toStringAsFixed(2)} L';

  factory BusinessHealthModel.fromJson(Map<String, dynamic> json) {
    // Conversion factor to convert to lacs
    const double lacConversion = 100000.0;

    // Extract stockDiff
    final stockDiff = json['stockDiff'] ?? {};
    final differenceInStock = (stockDiff['diff'] ?? 0).toDouble() / lacConversion;
    final differenceInStockGst = (stockDiff['diffGst'] ?? 0).toDouble() / lacConversion;

    // Extract profitLoss
    final profitLoss = (json['profitLoss'] ?? 0).toDouble() / lacConversion;

    // Extract openingClosingStock
    final openingClosingStock = json['openingClosingStock'] ?? {};
    final openingStock = (openingClosingStock['openingValue'] ?? 0).toDouble() / lacConversion;
    final openingStockGst = (openingClosingStock['openingValueWithGst'] ?? 0).toDouble() / lacConversion;
    final closingStock = (openingClosingStock['closingValue'] ?? 0).toDouble() / lacConversion;
    final closingStockGst = (openingClosingStock['closingValueWithGst'] ?? 0).toDouble() / lacConversion;

    // Extract trialBalance accounts
    final trialBalance = json['trialBalance'] as List<dynamic>? ?? [];

    double sundryCreditors = 0.0;
    double sundryDebtors = 0.0;
    double bankAccounts = 0.0;
    double cashInHand = 0.0;
    double purchaseAccount = 0.0;
    double salesAccount = 0.0;

    for (var account in trialBalance) {
      final accName = account['accName'] as String? ?? '';
      final closing = (account['closing'] ?? 0).toDouble() / lacConversion;

      if (accName == 'Sundry Creditors') {
        sundryCreditors = -closing;
      } else if (accName == 'Sundry Debtors') {
        sundryDebtors = closing;
      } else if (accName == 'Bank Accounts') {
        bankAccounts = closing;
      } else if (accName == 'Cash-in-Hand') {
        cashInHand = closing;
      } else if (accName == 'Purchase Accounts') {
        purchaseAccount = closing;
      } else if (accName == 'Sales Account') {
        salesAccount = -closing;
      }
    }

    // Calculate business index (a + b) where a = profitLoss, b = differenceInStockGst
    final businessIndex = profitLoss + differenceInStockGst;

    return BusinessHealthModel(
      sundryCreditors: sundryCreditors,
      sundryDebtors: sundryDebtors,
      bankAccounts: bankAccounts,
      cashInHand: cashInHand,
      purchaseAccount: purchaseAccount,
      salesAccount: salesAccount,
      openingStock: openingStock,
      openingStockGst: openingStockGst,
      closingStock: closingStock,
      closingStockGst: closingStockGst,
      profitLoss: profitLoss,
      differenceInStock: differenceInStock,
      differenceInStockGst: differenceInStockGst,
      businessIndex: businessIndex,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sundryCreditors': '${sundryCreditors.toStringAsFixed(2)}L',
      'sundryDebtors': '${sundryDebtors.toStringAsFixed(2)}L',
      'bankAccounts': '${bankAccounts.toStringAsFixed(2)}L',
      'cashInHand': '${cashInHand.toStringAsFixed(2)}L',
      'purchaseAccount': '${purchaseAccount.toStringAsFixed(2)}L',
      'salesAccount': '${salesAccount.toStringAsFixed(2)}L',
      'openingStock': '${openingStock.toStringAsFixed(2)}L',
      'openingStockGst': '${openingStockGst.toStringAsFixed(2)}L',
      'closingStock': '${closingStock.toStringAsFixed(2)}L',
      'closingStockGst': '${closingStockGst.toStringAsFixed(2)}L',
      'profitLoss': '${profitLoss.toStringAsFixed(2)}L',
      'differenceInStock': '${differenceInStock.toStringAsFixed(2)}L',
      'differenceInStockGst': '${differenceInStockGst.toStringAsFixed(2)}L',
      'businessIndex': '${businessIndex.toStringAsFixed(2)}L',
    };
  }
}
