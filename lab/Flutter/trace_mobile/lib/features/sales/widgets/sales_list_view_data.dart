import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/sales/classes/sales_item_model.dart';
import 'package:trace_mobile/features/sales/classes/sales_state.dart';
import 'package:trace_mobile/features/sales/widgets/sales_card_list_item.dart';

class SalesListViewData extends StatelessWidget {
  const SalesListViewData({Key? key, required this.dataList}) : super(key: key);

  final List<dynamic> dataList;
  @override
  Widget build(BuildContext context) {
    resolveSalesSummary(context, dataList);
    var salesState = context.read<SalesState>();
    return RefreshIndicator(
      onRefresh: () {
        return Future.delayed(Duration.zero, salesState.notify());
      },
      child: ListView.builder(
        itemCount: dataList.length,
        itemBuilder: (context, index) {
          return SalesCardListItem(
              index: index + 1,
              indexedItem: SalesItemModel.fromJson(j: dataList[index]));
        },
      ),
    );
  }

  resolveSalesSummary(BuildContext context, List<dynamic> dataList) {
    double rows = dataList.length.toDouble(),
        qty = 0,
        sale = 0,
        aggr = 0,
        age360Qty = 0,
        age360Sale = 0,
        age360Aggr = 0,
        age360GrossProfit = 0,
        grossProfit = 0;

    for (var item in dataList) {
      var indexedItem = SalesItemModel.fromJson(j: item);
      qty = qty + indexedItem.qty;
      sale = sale + indexedItem.amount;
      aggr = aggr + indexedItem.aggrSale;
      age360Qty = age360Qty + ((indexedItem.age >= 360) ? indexedItem.qty : 0);
      age360Sale =
          age360Sale + ((indexedItem.age >= 360) ? indexedItem.amount : 0);
      age360Aggr =
          age360Aggr + ((indexedItem.age >= 360) ? indexedItem.aggrSale : 0);
      age360GrossProfit = age360GrossProfit +
          ((indexedItem.age >= 360) ? indexedItem.grossProfit : 0);
      grossProfit = grossProfit + indexedItem.grossProfit;
    }
    // Future.delayed is used to run the code as Future.
    // Since the parent widget is in building mode, if I don't do this it throws error. It's just like mimicking a code to be run as future.
    Future.delayed(Duration.zero, () {
      context.read<SalesState>().summaryMap = {
        'rows': rows,
        'qty': qty,
        'sale': sale,
        'aggr': aggr,
        'age360Qty': age360Qty,
        'age360Sale': age360Sale,
        'age360Aggr': age360Aggr,
        'age360GrossProfit': age360GrossProfit,
        'grossProfit': grossProfit,
      };
    });
  }
}
