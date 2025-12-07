import 'package:flutter/material.dart';
import 'package:trace_mobile/common/widgets/bu_code_branch_header.dart';
import 'package:trace_mobile/features/accounts/widgets/trial_balance_body.dart';
import 'package:trace_mobile/features/accounts/widgets/trial_balance_footer.dart';
import 'package:trace_mobile/features/accounts/widgets/trial_balance_header.dart';

class AccountsTrialBalance extends StatelessWidget {
  const AccountsTrialBalance({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          automaticallyImplyLeading: false,
          title: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                InkWell(
                  child: Row(
                    children: [
                      const Icon(
                        Icons.chevron_left,
                        size: 30,
                        color: Colors.indigo,
                      ),
                      Text(
                        'Trial balance',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ],
                  ),
                  onTap: () {
                    Navigator.pop(context);
                  },
                ),
                const SizedBox(width: 5),
                const BuCodeBranchCodeHeader()
              ],
            ),
          )),
      body: Column(
        children: const [
          TrialBalanceHeader(),
          Expanded(
            child: TrialBalanceBody(),
          ),
          TrialBalanceFooter()
        ],
      ),
    );
  }
}
