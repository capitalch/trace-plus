import 'package:flutter/material.dart';
import 'package:trace_mobile/features/sales/widgets/sales_app_bar.dart';
import 'package:trace_mobile/features/sales/widgets/sales_report_body.dart';
import 'package:trace_mobile/features/sales/widgets/sales_report_header.dart';
import 'package:trace_mobile/features/sales/widgets/sales_report_summary.dart';

/*
Initiallly I started with Consumer widget. Since there are two states in SalesState class which can change I shifted to Selector widget
for performance optimization. Selector widget can select to rebuild when a particular value changes
*/
class SalesPage extends StatelessWidget {
  const SalesPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: const SalesAppBar(),
        ),
        body: Column(
          children: const [
            SalesReportHeader(),
            SizedBox(
              height: 5,
            ),
            SalesReportBody(),
            SizedBox(
              height: 5,
            ),
            SalesReportSummary()
          ],
        ));
  }
}



