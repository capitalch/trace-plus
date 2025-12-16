class SalesItemModel {
  SalesItemModel({
    required this.accounts,
    required this.age,
    required this.aggrSale,
    required this.amount,
    required this.autoRefNo,
    required this.brandName,
    required this.catName,
    required this.cgst,
    required this.grossProfit,
    required this.gstRate,
    required this.igst,
    required this.info,
    required this.label,
    required this.lastPurchaseDate,
    required this.price,
    required this.qty,
    required this.saleType,
    required this.sgst,
    required this.stock,
    required this.timestamp,
  });

  factory SalesItemModel.fromJson({required Map<String, dynamic> j}) {
    return SalesItemModel(
      accounts: j['accounts'],
      age: double.parse((j['age'] ?? 0).toString()),
      aggrSale: double.parse((j['aggrSale'] ?? 0).toString()),
      amount: double.parse((j['amount'] ?? 0).toString()),
      autoRefNo: j['autoRefNo'],
      brandName: j['brandName'] ?? '',
      catName: j['catName'] ?? '',
      cgst: double.parse((j['cgst'] ?? 0).toString()),
      grossProfit: double.parse((j['grossProfit'] ?? 0).toString()),
      gstRate: double.parse((j['gstRate'] ?? 0).toString()),
      igst: double.parse((j['igst'] ?? 0).toString()),
      info: j['info'] ?? '',
      label: j['label'] ?? '',
      lastPurchaseDate: j['lastPurchaseDate'] ?? '',
      price: double.parse((j['price'] ?? 0).toString()),
      qty: double.parse((j['qty'] ?? 0).toString()),
      saleType: j['saleType'],
      sgst: double.parse((j['sgst'] ?? 0).toString()),
      stock: double.parse((j['stock'] ?? 0).toString()),
      timestamp:j['timestamp'] ?? '',
    );
  }
  final String accounts;
  final double age;
  final double aggrSale;
  final double amount;
  final String autoRefNo;
  final String brandName;
  final String catName;
  final double cgst;
  final double grossProfit;
  final double gstRate;
  final double igst;
  final String? info;
  final String label;
  final String lastPurchaseDate;
  final double price;
  final double qty;
  final String saleType;
  final double sgst;
  final double stock;
  final String timestamp;
}
