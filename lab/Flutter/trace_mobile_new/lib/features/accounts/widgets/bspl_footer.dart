import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_bs_pl_state.dart';

class BsplFooter extends StatelessWidget {
  const BsplFooter({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context).textTheme;
    var formatter = NumberFormat('###,###.00');
    var bsplState = context.read<AccountsBsplState>();
    return Selector<AccountsBsplState, double>(
      selector: (p0, p1) => p1.aggregate,
      builder: (context, value, child) {
        return Container(
            width: double.maxFinite,
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 5),
            color: Colors.grey.shade300,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total',
                  style: theme.subtitle1?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(formatter.format(bsplState.aggregate),
                    style:
                        theme.subtitle1?.copyWith(fontWeight: FontWeight.bold))
              ],
            ));
      },
    );
  }
}