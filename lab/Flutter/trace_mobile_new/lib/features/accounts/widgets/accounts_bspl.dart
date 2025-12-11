import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/widgets/bu_code_branch_header.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_bs_pl_state.dart';
import 'package:trace_mobile/features/accounts/widgets/bspl_body.dart';
import 'package:trace_mobile/features/accounts/widgets/bspl_footer.dart';
import 'package:trace_mobile/features/accounts/widgets/bspl_header.dart';

class AccountsBsPl extends StatelessWidget {
  const AccountsBsPl({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bsplType = ModalRoute.of(context)!.settings.arguments.toString();
    var bsplState = context.read<AccountsBsplState>();
    bsplState.bsplType = bsplType;
    bsplState.init();
    final title = bsplType == 'bs' ? 'Balance sheet' : 'Profit & loss';
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
                        title,
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
            )),
      ),
      body: Column(children: const [
        BsplHeader(),
        Expanded(
          child: BsplBody(),
        ),
        BsplFooter()
      ]),
    );
  }
}
