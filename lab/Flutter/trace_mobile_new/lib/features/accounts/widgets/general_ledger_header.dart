import 'package:flutter/material.dart';

class GeneralLedgerHeader extends StatelessWidget {
  const GeneralLedgerHeader({Key? key, required this.accName})
      : super(key: key);
  final String accName;
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.only(left: 15),
      alignment: Alignment.centerLeft,
      child: Text(
        accName,
        style: theme.subtitle1,
      ),
    );
  }
}