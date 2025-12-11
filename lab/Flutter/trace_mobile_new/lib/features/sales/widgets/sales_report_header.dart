import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import 'package:trace_mobile/features/sales/classes/sales_query_props.dart';
import 'package:trace_mobile/features/sales/classes/sales_state.dart';

class SalesReportHeader extends StatelessWidget {
  const SalesReportHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var selector = Selector<SalesState, String>(
        selector: (p0, p1) => p1.salesQueryKey,
        builder: (context, value, child) {
          String queryKey = value == '' ? 'today' : value;
          var props = QueryProps()
              .getSalesQueryPropsList()
              .firstWhere((element) => element.salesQueryKey == queryKey);
          return (Container(
              padding: const EdgeInsets.only(
                left: 15,
              ),
              alignment: Alignment.center,
              color: Colors.grey.shade200,
              height: 25,
              child: Text(
                'Sale ${props.labelName} (${Utils.toLocalDateString(props.startDate)} to ${Utils.toLocalDateString(props.endDate)})',
                style: Theme.of(context)
                    .textTheme
                    .subtitle2
                    ?.copyWith(fontWeight: FontWeight.bold),
              )));
        });
    return selector;
  }
}