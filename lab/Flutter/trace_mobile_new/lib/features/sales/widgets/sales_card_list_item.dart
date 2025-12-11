import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile/features/sales/classes/sales_item_model.dart';

class SalesCardListItem extends StatelessWidget {
  const SalesCardListItem(
      {Key? key, required this.index, required this.indexedItem})
      : super(key: key);

  final int index;
  final SalesItemModel indexedItem;

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    double stock = indexedItem.stock;
    var title = [
      indexedItem.brandName,
      ' ',
      indexedItem.catName,
      ' ',
      indexedItem.label
    ].join();
    // var subTitle1 = indexedItem.info;
    var subTitle = [
      indexedItem.info,
      ' ',
      'Sale type: ',
      indexedItem.saleType,
      ' Accounts: ',
      indexedItem.accounts,
      ' ',
      DateFormat('hh:mm:ss a').format(DateTime.parse(indexedItem.timestamp).toLocal())
    ].join(); 
    var formatter = NumberFormat('#,##,000');
    return Center(
        child: Card(
            elevation: 1,
            color: ((indexedItem.age) >= 360)
                ? Colors.pink.shade100
                : Colors.grey.shade100,
            child: Column(children: [
              Container(
                padding: const EdgeInsets.only(top: 15),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.only(left: 70),
                        child: Text(
                          'AGE: ${indexedItem.age.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                      ),
                      Text(indexedItem.autoRefNo),
                      Container(
                        padding: const EdgeInsets.only(right: 15),
                        child: Text(
                            'GP: ${indexedItem.grossProfit.toStringAsFixed(0)}',
                            style:
                                const TextStyle(fontWeight: FontWeight.w900)),
                      )
                    ]),
              ),
              ListTile(
                  leading: Text(
                    index.toString(),
                    style: theme.textTheme.subtitle1
                        ?.copyWith(color: Colors.brown),
                  ),
                  title: Text(
                    title,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: Colors.blue.shade700,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  subtitle: Text(
                    subTitle,
                    style: theme.textTheme.bodyText1,
                  ),
                  dense: true,
                  trailing: CircleAvatar(
                      radius: 20,
                      backgroundColor: (indexedItem.stock == 0)
                          ? Colors.white
                          : Colors.grey.shade800,
                      child: Text(
                        stock.toStringAsFixed(0),
                        style: theme.textTheme.subtitle2?.copyWith(
                            color: (indexedItem.stock == 0)
                                ? Colors.black
                                : Colors.white),
                      ))),
              const SizedBox(
                height: 5,
              ),
              Container(
                padding: const EdgeInsets.only(bottom: 15),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.only(left: 70),
                      child: Text(
                        'Price: ${formatter.format(indexedItem.price * (1 + indexedItem.gstRate / 100))}',
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                    ),
                    Text(
                      'Qty: ${formatter.format(indexedItem.qty)}',
                      // style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    Container(
                      padding: const EdgeInsets.only(right: 15),
                      child: Text(
                        'Amount: ${formatter.format(indexedItem.amount)}',
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                    )
                  ],
                ),
              )
            ])));
  }
}