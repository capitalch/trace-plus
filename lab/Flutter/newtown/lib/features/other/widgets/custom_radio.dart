import 'package:flutter/material.dart';

class CustomRadio extends StatefulWidget {
  final String item1;
  final String item2;
  final String? selectedItem;
  final ValueChanged<String> onItemChanged;
  final String label;

  CustomRadio({
    Key? key,
    required this.item1,
    required this.item2,
    this.selectedItem,
    required this.onItemChanged,
    required this.label,
  }) : super(key: key);

  @override
  _CustomRadioState createState() => _CustomRadioState();
}

class _CustomRadioState extends State<CustomRadio> {
  late final ValueNotifier<String> _groupVal;

  @override
  void initState() {
    super.initState();
    _groupVal = ValueNotifier(widget.selectedItem ?? widget.item1);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: Theme.of(context).textTheme.bodyLarge),
        SizedBox(height: 8),
        ValueListenableBuilder(
            valueListenable: _groupVal,
            builder: (_, __, ___) {
              return Row(children: [
                _buildItem(widget.item1),
                SizedBox(width: 12),
                _buildItem(widget.item2),
              ]);
            }),
        SizedBox(height: 16),
      ],
    );
  }

  Widget _buildItem(String item) {
    return Expanded(
      child: Container(
        height: 54,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Radio<String>(
              value: item,
              groupValue: _groupVal.value,
              onChanged: (val) {
                _groupVal.value = val!;
                widget.onItemChanged(val);
              },
            ),
            Text(item, style: Theme.of(context).textTheme.bodyLarge),
          ],
        ),
      ),
    );
  }
}
