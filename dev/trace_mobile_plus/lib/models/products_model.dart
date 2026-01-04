class ProductsModel {
  final int id;
  final String productCode;
  final String catName;
  final String brandName;
  final String label;
  final double clos;
  final double lastPurchasePriceGst;
  final int age;
  final int hsn;
  final String info;
  final String upcCode;
  final double gstRate;
  final double salePrice;
  final double salePriceGst;
  final double sale;
  final double saleDiscount;
  final double lastPurchasePrice;
  final double op;
  final double openingPrice;
  final double openingPriceGst;
  final double maxRetailPrice;

  ProductsModel({
    required this.id,
    required this.productCode,
    required this.catName,
    required this.brandName,
    required this.label,
    required this.clos,
    required this.lastPurchasePriceGst,
    required this.age,
    required this.hsn,
    required this.info,
    required this.upcCode,
    required this.gstRate,
    required this.salePrice,
    required this.salePriceGst,
    required this.sale,
    required this.saleDiscount,
    required this.lastPurchasePrice,
    required this.op,
    required this.openingPrice,
    required this.openingPriceGst,
    required this.maxRetailPrice,
  });

  factory ProductsModel.fromJson(Map<String, dynamic> json) {
    return ProductsModel(
      id: json['id'] ?? 0,
      productCode: json['productCode'] ?? '',
      catName: json['catName'] ?? '',
      brandName: json['brandName'] ?? '',
      label: json['label'] ?? '',
      clos: (json['clos'] ?? 0).toDouble(),
      lastPurchasePriceGst: (json['lastPurchasePriceGst'] ?? 0).toDouble(),
      age: (json['age'] ?? 0).toInt(),
      hsn: (json['hsn'] ?? 0).toInt(),
      info: json['info'] ?? '',
      upcCode: json['upcCode'] ?? '',
      gstRate: (json['gstRate'] ?? 0).toDouble(),
      salePrice: (json['salePrice'] ?? 0).toDouble(),
      salePriceGst: (json['salePriceGst'] ?? 0).toDouble(),
      sale: (json['sale'] ?? 0).toDouble(),
      saleDiscount: (json['saleDiscount'] ?? 0).toDouble(),
      lastPurchasePrice: (json['lastPurchasePrice'] ?? 0).toDouble(),
      op: (json['op'] ?? 0).toDouble(),
      openingPrice: (json['openingPrice'] ?? 0).toDouble(),
      openingPriceGst: (json['openingPriceGst'] ?? 0).toDouble(),
      maxRetailPrice: (json['maxRetailPrice'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productCode': productCode,
      'catName': catName,
      'brandName': brandName,
      'label': label,
      'clos': clos,
      'lastPurchasePriceGst': lastPurchasePriceGst,
      'age': age,
      'hsn': hsn,
      'info': info,
      'upcCode': upcCode,
      'gstRate': gstRate,
      'salePrice': salePrice,
      'salePriceGst': salePriceGst,
      'sale': sale,
      'saleDiscount': saleDiscount,
      'lastPurchasePrice': lastPurchasePrice,
      'op': op,
      'openingPrice': openingPrice,
      'openingPriceGst': openingPriceGst,
      'maxRetailPrice': maxRetailPrice,
    };
  }
}
