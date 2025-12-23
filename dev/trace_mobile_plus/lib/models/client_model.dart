class ClientModel {
  final String id;
  final String clientName;

  ClientModel({
    required this.id,
    required this.clientName,
  });

  /// Create ClientModel from JSON
  factory ClientModel.fromJson(Map<String, dynamic> json) {
    return ClientModel(
      id: json['id'].toString(),
      clientName: json['clientName'] as String,
    );
  }

  /// Convert ClientModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'clientName': clientName,
    };
  }

  @override
  String toString() => 'ClientModel(id: $id, clientName: $clientName)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ClientModel && other.id == id && other.clientName == clientName;
  }

  @override
  int get hashCode => id.hashCode ^ clientName.hashCode;
}
