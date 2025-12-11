import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'package:trace_mobile/common/classes/utils.dart';

class DashboardAppBar extends StatelessWidget with PreferredSizeWidget {
  const DashboardAppBar({Key? key}) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(40);

  @override
  Widget build(BuildContext context) {
    var globalSettings = Provider.of<GlobalSettings>(context, listen: true);
    return AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Menu
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                InkWell(
                  child: const Padding(
                    padding: EdgeInsets.only(right: 5),
                    child: Icon(
                      Icons.menu_sharp,
                      size: 30,
                    ),
                  ),
                  onTap: () {
                    Scaffold.of(context).openDrawer();
                  },
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 5),
                  child: Text(
                    'Dashboard',
                    style: Theme.of(context).textTheme.headline6,
                  ),
                ),
              ],
            ),
            // Bu
            InkWell(
              child: Container(
                  padding: const EdgeInsets.only(top: 5, bottom: 3),
                  child: SizedBox(
                    width: 150,
                    child: Text(
                      '${globalSettings.lastUsedBuCode}',
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyText2?.copyWith(
                            color: Colors.indigo,
                            // decoration: TextDecoration.underline
                          ),
                    ),
                  )),
              onTap: () {
                changeBuCode(context, globalSettings);
              },
            ),
            // Logout
            InkWell(
              child: Padding(
                padding: const EdgeInsets.only(top: 3),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(
                    Icons.logout,
                    size: 15,
                    color: Colors.orange,
                  ),
                  Text('Logout',
                      style: Theme.of(context)
                          .textTheme
                          .caption
                          ?.copyWith(color: Colors.orange))
                ]),
              ),
              onTap: () {
                logout(context);
              },
            )
          ],
        ));
  }
}

changeBuCode(BuildContext context, GlobalSettings globalSettings) async {
  var result = await showDialog(
    barrierDismissible: false,
    context: context,
    builder: (context) {
      return (SimpleDialog(
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Select a business unit'),
              InkWell(
                child: const Icon(Icons.close),
                onTap: () {
                  Navigator.pop(context, '0');
                },
              ),
            ],
          ),
          children: getBusinessUnitOptions(context, globalSettings)));
    },
  );
  if (result != '0') {
    // Save in database
    var result1 = await GraphQLQueries.genericUpdateMaster(
        globalSettings: globalSettings,
        entityName: 'authentication',
        tableName: 'TraceUser',
        args: {
          'id': globalSettings
              .id, // id is used for update of the table, otherwise insert will happen
          'lastUsedBuCode': result,
        });
    if ((result1?.data != null) && (result1?.exception == null)) {
      // success
      globalSettings.setLastUsedBuCode(result);
      await Utils.execDataCache(globalSettings);
      globalSettings.justNotifyListeners();
    }
  }
}

List<SimpleDialogOption>? getBusinessUnitOptions(
    BuildContext context, GlobalSettings globalSettings) {
  List<dynamic>? buCodes = globalSettings.buCodes;
  var buCodesList = buCodes?.map((e) {
    return SimpleDialogOption(
      onPressed: () {
        Navigator.pop(context, e.toString());
      },
      child: Text(e.toString()),
    );
  }).toList();

  return buCodesList;
}

void logout(BuildContext context) {
  Provider.of<GlobalSettings>(context, listen: false).resetLoginData();
  Navigator.pop(context);
}
