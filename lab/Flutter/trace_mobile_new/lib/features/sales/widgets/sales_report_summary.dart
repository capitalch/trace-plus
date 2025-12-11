import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/sales/classes/sales_state.dart';

class SalesReportSummary extends StatelessWidget {
  const SalesReportSummary({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var formatter = NumberFormat('#,##,000');
    var theme = Theme.of(context)
        .textTheme
        .subtitle2
        ?.copyWith(fontWeight: FontWeight.bold);
    return Selector<SalesState, Map<String, double>>(
      selector: (p0, p1) => p1.summaryMap,
      builder: (context, value, child) {
        return Container(
            width: double.infinity,
            height: 25,
            color: Colors.grey.shade300,
            padding: const EdgeInsets.only(left: 5, top: 2, bottom: 5),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                Material(
                  child: InkWell(
                      splashColor: Theme.of(context).primaryColorLight,
                      onTap: () {
                        context.read<SalesState>().notify();
                      },
                      child: Ink(
                        color: Colors.grey.shade300,
                        padding: const EdgeInsets.only(right: 10),
                        child: const Icon(Icons.sync,
                            size: 20, color: Colors.lightBlue),
                      )),
                ),
                Text(
                  'Rows: ${formatter.format(value['rows'] ?? 0)}',
                  style: theme,
                ),
                const SizedBox(width: 15),
                Text('Qty: ${formatter.format(value['qty'] ?? 0)}',
                    style: theme),
                const SizedBox(width: 15),
                Text('GP: ${formatter.format(value['grossProfit'] ?? 0)}',
                    style: theme),
                const SizedBox(width: 15),
                Text('Sale: ${formatter.format(value['sale'] ?? 0)}',
                    style: theme),
                const SizedBox(width: 15),
                Text('Aggr: ${formatter.format(value['aggr'] ?? 0)}',
                    style: theme),
                const SizedBox(width: 15),
                Text(
                    'Age360 sale: ${formatter.format(value['age360Sale'] ?? 0)}',
                    style: theme),
                const SizedBox(width: 15),
                Text(
                    'Age360 GP: ${formatter.format(value['age360GrossProfit'] ?? 0)}',
                    style: theme),
                const SizedBox(width: 15),
                Text(
                    'Age360 aggr: ${formatter.format(value['age360Aggr'] ?? 0)}',
                    style: theme),
                const SizedBox(width: 15),
                Text('Age360 qty: ${formatter.format(value['age360Qty'] ?? 0)}',
                    style: theme),
              ]),
            ));
      },
    );
  }
}
