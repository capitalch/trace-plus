import 'package:flutter/material.dart';
import 'package:trace_mobile/common/classes/routes.dart';
import 'package:trace_mobile/common/widgets/bu_code_branch_header.dart';

class AccountsPage extends StatelessWidget {
  const AccountsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var themeStyle = Theme.of(context).textTheme;
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
                        'Accounts',
                        style: Theme.of(context).textTheme.headline6,
                      ),
                    ],
                  ),
                  onTap: () {
                    Navigator.pop(context);
                  },
                ),
                const SizedBox(
                  width: 5,
                ),
                const BuCodeBranchCodeHeader()
              ],
            ),
          )),
      body: ListView(children: [
        Padding(
          padding: const EdgeInsets.all(3),
          child: ListTile(
            tileColor: Colors.grey.shade200,
            title: Text(
              'Trial balance',
              style: themeStyle.subtitle1?.copyWith(fontWeight: FontWeight.bold),
            ),
            onTap: () {
              Navigator.pushNamed(context, Routes.trialBalance);
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(3),
          child: ListTile(
            tileColor: Colors.grey.shade200,
            title: Text(
              'Balance sheet',
              style: themeStyle.subtitle1?.copyWith(fontWeight: FontWeight.bold),
            ),
            onTap: () {
              Navigator.pushNamed(context, Routes.bspl, arguments: 'bs');
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(3),
          child: ListTile(
            tileColor: Colors.grey.shade200,
            title: Text(
              'Profit and loss account',
              style: themeStyle.subtitle1?.copyWith(fontWeight: FontWeight.bold),
            ),
            onTap: () {
              Navigator.pushNamed(context, Routes.bspl, arguments: 'pl');
            },
          ),
        ),
      ]),
    );
  }
}
