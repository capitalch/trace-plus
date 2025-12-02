import 'package:flutter/material.dart';


class TrialBalanceHeader extends StatelessWidget {
  const TrialBalanceHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.maxFinite,
      color: Colors.grey.shade300,
      padding: const EdgeInsets.only(left: 35, top: 5, bottom: 5, right: 15),
      child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text('Opening'),
            Text('Debits'),
            Text('Credits'),
            Text('Closing')
          ]),
    );
  }
}