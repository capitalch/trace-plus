import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import 'package:trace_mobile/features/sales/classes/sales_query_props.dart';
import 'package:trace_mobile/features/sales/classes/sales_state.dart';
import 'package:trace_mobile/features/sales/widgets/sales_list_view_data.dart';
import 'package:tuple/tuple.dart';

class SalesReportBody extends StatelessWidget {
  const SalesReportBody({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    GlobalSettings globalSettings =
        Provider.of<GlobalSettings>(context, listen: false);
    context.read<SalesState>().init();

    // Used Tuple package for depending on multiple values for selector. notifyToggle state is used for rebuikding unconditionally when refresh inkwell is clicked
    return Selector<SalesState, Tuple2<String, bool>>(
        selector: (p0, p1) => Tuple2(p1.salesQueryKey, p1.notifyToggle),
        builder: (context, value, child) {
          String queryKey = value.item1 == '' ? 'today' : value.item1;
          var props = QueryProps()
              .getSalesQueryPropsList()
              .firstWhere((element) => element.salesQueryKey == queryKey);
          var salesFuture = GraphQLQueries.genericView(
              globalSettings: globalSettings,
              isMultipleRows: true,
              sqlKey: 'get_sale_report',
              args: {
                'startDate': Utils.toIsoDateString(props.startDate),
                'endDate': Utils.toIsoDateString(props.endDate),
                'tagId': '0',
                'days': 0
              });
          return FutureBuilder(
            future: salesFuture,
            builder: (context, snapshot) {
              dynamic widget = const Text('');
              if (snapshot.connectionState == ConnectionState.waiting) {
                widget = Text('Loading...',
                    style: Theme.of(context).textTheme.headline6);
              } else {
                if (snapshot.hasError) {
                  widget = const Text('Data error');
                } else if (snapshot.hasData) {
                  List<dynamic> dataList =
                      snapshot.data?.data?['accounts']?['genericView'] ?? [];
                  if (dataList.isEmpty) {
                    setEmptyDataState(context);
                    widget = Center(
                      child: Text(
                        'No data',
                        style: Theme.of(context).textTheme.headline6,
                      ),
                    );
                  } else {
                    widget = SalesListViewData(
                      dataList: dataList,
                    );
                  }
                } else {
                  setEmptyDataState(context);
                  widget = const Text('No data');
                }
              }
              return Expanded(
                  child: Center(
                child: widget,
              ));
            },
          );
        });
  }

  setEmptyDataState(BuildContext context) {
    Future.delayed(Duration.zero, () {
      context.read<SalesState>().summaryMap = {
        'rows': 0,
        'qty': 0,
        'sale': 0,
        'aggr': 0,
        'age360Qty': 0,
        'age360Sale': 0,
        'age360Aggr': 0,
        'age360GrossProfit': 0,
        'grossProfit': 0,
      };
    });
  }
}
