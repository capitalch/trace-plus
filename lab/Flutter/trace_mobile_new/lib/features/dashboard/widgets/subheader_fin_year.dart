import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';

class SubheaderFinYear extends StatelessWidget {
  const SubheaderFinYear({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    GlobalSettings globalSettings =
        Provider.of<GlobalSettings>(context, listen: true);
    var currentFinYearId = globalSettings.currentFinYearMap['finYearId'];
    return Container(
      padding: const EdgeInsets.all(0),
      child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Add icon
            InkWell(
              borderRadius: BorderRadius.circular(5),
              child: Container(
                padding:
                    const EdgeInsets.only(left: 3, top: 3, bottom: 3, right: 3),
                child: const Icon(Icons.add_sharp, color: Colors.indigo,),
              ),
              onTap: () {
                globalSettings.changeCurrentFinYear(1);
              },
            ),
            // Year
            Text('${currentFinYearId ?? "    "}'),
            InkWell(
              // minus icon
              child: Container(
                padding:
                    const EdgeInsets.only(left: 3, top: 3, bottom: 3, right: 3),
                child: const Icon(
                  Icons.remove_sharp, color: Colors.indigo,
                ),
              ),
              onTap: () {
                globalSettings.changeCurrentFinYear(-1);
              },
            ),
          ]),
    );
  }
}
