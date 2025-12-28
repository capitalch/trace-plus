class SalesCardModel {
  final DateTime tranDate;
  final int productId;
  final double price;
  final double lastPurchasePrice;
  final double gstRate;
  final int tranTypeId;
  final int salePurchaseDetailsId;
  final String autoRefNo;
  final String? contact;
  final String? commonRemarks;
  final String? lineRemarks;
  final double qty;
  final double aggrSale;
  final double cgst;
  final double sgst;
  final double igst;
  final double amount;
  final String saleType;
  final double grossProfit;
  final DateTime? lastPurchaseDate;
  final DateTime timestamp;
  final String? accounts;
  final String productCode;
  final String catName;
  final String brandName;
  final String label;
  final double stock;
  final String? info;

  SalesCardModel({
    required this.tranDate,
    required this.productId,
    required this.price,
    required this.lastPurchasePrice,
    required this.gstRate,
    required this.tranTypeId,
    required this.salePurchaseDetailsId,
    required this.autoRefNo,
    this.contact,
    this.commonRemarks,
    this.lineRemarks,
    required this.qty,
    required this.aggrSale,
    required this.cgst,
    required this.sgst,
    required this.igst,
    required this.amount,
    required this.saleType,
    required this.grossProfit,
    this.lastPurchaseDate,
    required this.timestamp,
    this.accounts,
    required this.productCode,
    required this.catName,
    required this.brandName,
    required this.label,
    required this.stock,
    this.info,
  });

  factory SalesCardModel.fromJson(Map<String, dynamic> json) {
    return SalesCardModel(
      tranDate: DateTime.parse(json['tranDate'] as String),
      productId: json['productId'] is int ? json['productId'] as int : int.parse(json['productId'] as String),
      price: (json['price'] as num).toDouble(),
      lastPurchasePrice: (json['lastPurchasePrice'] as num).toDouble(),
      gstRate: (json['gstRate'] as num).toDouble(),
      tranTypeId: json['tranTypeId'] is int ? json['tranTypeId'] as int : int.parse(json['tranTypeId'] as String),
      salePurchaseDetailsId: json['salePurchaseDetailsId'] is int ? json['salePurchaseDetailsId'] as int : int.parse(json['salePurchaseDetailsId'] as String),
      autoRefNo: json['autoRefNo'] as String,
      contact: json['contact'] as String?,
      commonRemarks: json['commonRemarks'] as String?,
      lineRemarks: json['lineRemarks'] as String?,
      qty: (json['qty'] as num).toDouble(),
      aggrSale: (json['aggrSale'] as num).toDouble(),
      cgst: (json['cgst'] as num).toDouble(),
      sgst: (json['sgst'] as num).toDouble(),
      igst: (json['igst'] as num).toDouble(),
      amount: (json['amount'] as num).toDouble(),
      saleType: json['saleType'] as String,
      grossProfit: (json['grossProfit'] as num).toDouble(),
      lastPurchaseDate: json['lastPurchaseDate'] != null
          ? DateTime.parse(json['lastPurchaseDate'] as String)
          : null,
      timestamp: DateTime.parse(json['timestamp'] as String),
      accounts: json['accounts'] as String?,
      productCode: json['productCode'] as String,
      catName: json['catName'] as String,
      brandName: json['brandName'] as String,
      label: json['label'] as String,
      stock: (json['stock'] as num).toDouble(),
      info: json['info'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tranDate': tranDate.toIso8601String(),
      'productId': productId,
      'price': price,
      'lastPurchasePrice': lastPurchasePrice,
      'gstRate': gstRate,
      'tranTypeId': tranTypeId,
      'salePurchaseDetailsId': salePurchaseDetailsId,
      'autoRefNo': autoRefNo,
      'contact': contact,
      'commonRemarks': commonRemarks,
      'lineRemarks': lineRemarks,
      'qty': qty,
      'aggrSale': aggrSale,
      'cgst': cgst,
      'sgst': sgst,
      'igst': igst,
      'amount': amount,
      'saleType': saleType,
      'grossProfit': grossProfit,
      'lastPurchaseDate': lastPurchaseDate?.toIso8601String(),
      'timestamp': timestamp.toIso8601String(),
      'accounts': accounts,
      'productCode': productCode,
      'catName': catName,
      'brandName': brandName,
      'label': label,
      'stock': stock,
      'info': info,
    };
  }
}
