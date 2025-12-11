class Client {
  final int id;
  final String name;
  final String? code;
  final bool isActive;

  Client({
    required this.id,
    required this.name,
    this.code,
    this.isActive = true,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'] as int,
      name: json['clientName'] as String? ?? json['name'] as String,
      code: json['clientCode'] as String? ?? json['code'] as String?,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'clientName': name,
      'clientCode': code,
      'isActive': isActive,
    };
  }

  @override
  String toString() => name; // For Autocomplete display

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Client && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
