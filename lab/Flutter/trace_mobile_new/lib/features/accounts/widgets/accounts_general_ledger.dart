import 'package:flutter/material.dart';
import 'package:trace_mobile/common/widgets/bu_code_branch_header.dart';
import 'package:trace_mobile/features/accounts/widgets/general_ledger_body.dart';
import 'package:trace_mobile/features/accounts/widgets/general_ledger_footer.dart';
import 'package:trace_mobile/features/accounts/widgets/general_ledger_header.dart';

class AccountsGeneralLedger extends StatelessWidget {
  const AccountsGeneralLedger({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    dynamic args = ModalRoute.of(context)!.settings.arguments;

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
                        'General ledger',
                        style: Theme.of(context).textTheme.headline6,
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
        children: [
          GeneralLedgerHeader(accName: (args!['accName'])),
          Expanded(
            child: GeneralLedgerBody(accId: args['accId']),
          ),
          const GeneralLedgerFooter()
        ],
      ),
    );
  }
}
