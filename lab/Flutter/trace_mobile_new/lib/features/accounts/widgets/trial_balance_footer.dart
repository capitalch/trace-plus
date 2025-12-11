import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_trial_balance_state.dart';

class TrialBalanceFooter extends StatelessWidget {
  const TrialBalanceFooter({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var formatter = NumberFormat('###,###.00');
    context.read<AccountsTrialBalanceState>().init();
    return Selector<AccountsTrialBalanceState, Summary>(
      selector: (p0, p1) => p1.summary,
      builder: (context, value, child) {
        return Container(
          width: double.infinity,
          color: Colors.grey.shade300,
          alignment: Alignment.center,
          child: SingleChildScrollView(
            padding:
                const EdgeInsets.only(left: 15, top: 5, bottom: 5, right: 15),
            scrollDirection: Axis.horizontal,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
              Row(
                children: [
                  Text(formatter.format(value.opening)),
                  const SizedBox(
                    width: 2,
                  ),
                  Text(value.openingDC)
                ],
              ),
              const SizedBox(width: 15),
              Text(formatter.format(value.debits)),
              const SizedBox(
                width: 15,
              ),
              Text(formatter.format(value.credits)),
              const SizedBox(
                width: 15,
              ),
              Row(
                children: [
                  Text(formatter.format(value.closing)),
                  const SizedBox(
                    width: 2,
                  ),
                  Text(value.closingDC)
                ],
              ),
            ]),
            // )
          ),
        );
      },
    );
  }
}
