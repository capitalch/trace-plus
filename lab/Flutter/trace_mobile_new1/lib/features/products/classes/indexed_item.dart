class IndexedItem {
  IndexedItem({
    required this.age,
    required this.brandName,
    required this.catName,
    required this.clos,
    required this.info,
    required this.label,
    required this.mrp,
    required this.op,
    required this.openingPrice,
    required this.openingPriceGst,
    required this.pur,
    required this.purGst,
    required this.salGst,
    required this.ytd,
  });

  factory IndexedItem.fromJson({required Map<String, dynamic> j}) {
    return IndexedItem(
      age: double.parse((j['age'] ?? 0).toString()),
      brandName: j['brandName'],
      catName: j['catName'],
      clos: double.parse(j['clos'].toString()),
      info: j['info'],
      label: j['label'],
      mrp: double.parse((j['maxRetailPrice'] ?? 0).toString()),
      op: double.parse(j['op'].toString()),
      openingPrice: double.parse(j['openingPrice'].toString()),
      openingPriceGst: double.parse(j['openingPriceGst'].toString()),
      pur: double.parse(j['lastPurchasePrice'].toString()),
      purGst: double.parse(j['lastPurchasePriceGst'].toString()),
      salGst: double.parse(j['salePriceGst'].toString()),
      ytd: double.parse((j['sale'] ?? 0).toString()),
    );
  }
  final double age;
  final String brandName;
  final String catName;
  final double clos;
  final String? info;
  final String label;
  final double mrp;
  final double op;
  final double openingPrice;
  final double openingPriceGst;
  final double pur;
  final double purGst;
  final double salGst;
  final double ytd;
}
