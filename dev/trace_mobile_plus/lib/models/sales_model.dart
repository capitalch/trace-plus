class SalesModel {
  final int saleId;
  final String saleNumber;
  final DateTime saleDate;
  final String customerName;
  final double totalAmount;
  final String status;
  final int itemCount;

  SalesModel({
    required this.saleId,
    required this.saleNumber,
    required this.saleDate,
    required this.customerName,
    required this.totalAmount,
    required this.status,
    required this.itemCount,
  });

  factory SalesModel.fromJson(Map<String, dynamic> json) {
    return SalesModel(
      saleId: json['sale_id'] ?? 0,
      saleNumber: json['sale_number'] ?? '',
      saleDate: json['sale_date'] != null
          ? DateTime.parse(json['sale_date'])
          : DateTime.now(),
      customerName: json['customer_name'] ?? '',
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      status: json['status'] ?? '',
      itemCount: json['item_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sale_id': saleId,
      'sale_number': saleNumber,
      'sale_date': saleDate.toIso8601String(),
      'customer_name': customerName,
      'total_amount': totalAmount,
      'status': status,
      'item_count': itemCount,
    };
  }
}
