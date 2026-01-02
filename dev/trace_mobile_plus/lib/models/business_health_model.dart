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

  factory BusinessHealthModel.fromJson(Map<String, dynamic> json) {
    // Extract stockDiff
    final stockDiff = json['stockDiff'] ?? {};
    final differenceInStock = (stockDiff['diff'] ?? 0).toDouble();
    final differenceInStockGst = (stockDiff['diffGst'] ?? 0).toDouble();

    // Extract profitLoss
    final profitLoss = (json['profitLoss'] ?? 0).toDouble();

    // Extract openingClosingStock
    final openingClosingStock = json['openingClosingStock'] ?? {};
    final openingStock = (openingClosingStock['openingValue'] ?? 0).toDouble();
    final openingStockGst = (openingClosingStock['openingValueWithGst'] ?? 0).toDouble();
    final closingStock = (openingClosingStock['closingValue'] ?? 0).toDouble();
    final closingStockGst = (openingClosingStock['closingValueWithGst'] ?? 0).toDouble();

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
      final closing = (account['closing'] ?? 0).toDouble();

      if (accName == 'Sundry Creditors') {
        sundryCreditors = closing;
      } else if (accName == 'Sundry Debtors') {
        sundryDebtors = closing;
      } else if (accName == 'Bank Accounts') {
        bankAccounts = closing;
      } else if (accName == 'Cash-in-Hand') {
        cashInHand = closing;
      } else if (accName == 'Purchase Accounts') {
        purchaseAccount = closing;
      } else if (accName == 'Sales Account') {
        salesAccount = closing;
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
      'sundryCreditors': sundryCreditors,
      'sundryDebtors': sundryDebtors,
      'bankAccounts': bankAccounts,
      'cashInHand': cashInHand,
      'purchaseAccount': purchaseAccount,
      'salesAccount': salesAccount,
      'openingStock': openingStock,
      'openingStockGst': openingStockGst,
      'closingStock': closingStock,
      'closingStockGst': closingStockGst,
      'profitLoss': profitLoss,
      'differenceInStock': differenceInStock,
      'differenceInStockGst': differenceInStockGst,
      'businessIndex': businessIndex,
    };
  }
}
