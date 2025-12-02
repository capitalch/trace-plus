extension DateTimeParser on DateTime {
  String toJson() {
    final year = this.year.toString();
    final month = this.month.toString().padLeft(2, '0');
    final day = this.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }
}

extension DateFromString on String {
  DateTime? get date {
    return DateTime.tryParse(this);
  }
}
