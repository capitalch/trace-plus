import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import 'package:trace_mobile/features/dashboard/widgets/subheader_fin_year.dart';

class DashboardSubheader extends StatelessWidget {
  const DashboardSubheader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var globalSettings = Provider.of<GlobalSettings>(context, listen: true);
    return Container(
      padding: const EdgeInsets.only(left: 15, top: 0),
      color: Colors.grey.shade100,
      height: 30,
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        // buCode name
        Container(
            padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
            child: SizedBox(
              width: 200,
              child: Text(globalSettings.unitInfo['unitName'] ?? '',
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyText2
                  // ?.copyWith(color: Colors.indigo),
                  ),
            )),
        const SubheaderFinYear(),

        InkWell(
          // Branch
          child: Container(
            padding:
                const EdgeInsets.only(left: 0, top: 5, bottom: 5, right: 0),
            child: 
            SizedBox(width: 50, child:Text(
              globalSettings.currentBranchMap['branchCode'] ?? '',
              style: const TextStyle(color: Colors.indigo, overflow: TextOverflow.ellipsis),
            ),)
            
          ),
          onTap: () {
            changeBranch(context, globalSettings);
          },
        ),
      ]),
    );
  }
}

void changeBranch(BuildContext context, GlobalSettings globalSettings) async {
  var result = await showDialog(
    barrierDismissible: false,
    context: context,
    builder: (context) {
      return (SimpleDialog(
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Select a Branch'),
              InkWell(
                child: const Icon(Icons.close),
                onTap: () {
                  Navigator.pop(context, '0');
                },
              ),
            ],
          ),
          children: getBranchOptions(context, globalSettings)));
    },
  );
  if (result != '0') {
    globalSettings.setLastUsedBranch(result);
    Utils.execDataCache(globalSettings);
  }
}

List<SimpleDialogOption>? getBranchOptions(
    BuildContext context, GlobalSettings globalSettings) {
  List<dynamic>? allBranches = globalSettings.allBranches;
  var branchList = allBranches.map((e) {
    return SimpleDialogOption(
      onPressed: () {
        Navigator.pop(context, e['branchId'].toString());
      },
      child: Text(e['branchName']),
    );
  }).toList();

  return branchList;
}
