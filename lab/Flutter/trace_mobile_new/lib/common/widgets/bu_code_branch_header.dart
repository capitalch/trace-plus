import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';

class BuCodeBranchCodeHeader extends StatelessWidget {
  const BuCodeBranchCodeHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var buCode = context.read<GlobalSettings>().lastUsedBuCode;
    var branchMap = context.read<GlobalSettings>().currentBranchMap;
    var finYearMap = context.read<GlobalSettings>().currentFinYearMap;
    var theme = Theme.of(context).textTheme;
    return Row(
      children: [
        Text(
          buCode ?? '',
          overflow: TextOverflow.ellipsis,
          style: theme.subtitle2,
        ),
        const SizedBox(
          width: 5,
        ),
        Text(
          branchMap['branchName'],
          style: theme.subtitle2,
        ),
        const SizedBox(
          width: 5,
        ),
        Text(
          finYearMap['finYearId'].toString(),
          style: theme.subtitle2,
        )
      ],
    );
  }
}
