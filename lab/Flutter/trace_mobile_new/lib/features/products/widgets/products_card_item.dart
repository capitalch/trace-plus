import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile/features/products/classes/indexed_item.dart';

class ProductsCardItem extends StatelessWidget {
  const ProductsCardItem({Key? key, required this.indexedItem, required this.index})
      : super(key: key);
  final IndexedItem indexedItem;
  final int index;

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);
    double close = indexedItem.clos;
    var title = [
      indexedItem.brandName,
      ' ',
      indexedItem.catName,
      ' ',
      indexedItem.label
    ].join();
    var subTitle = indexedItem.info;
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
                      Text('YTD: ${indexedItem.ytd.toStringAsFixed(0)}'),
                      Container(
                        padding: const EdgeInsets.only(right: 15),
                        child: Text(
                          'MRP: ${formatter.format(indexedItem.mrp)}',
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
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
                    subTitle ?? '',
                    style: theme.textTheme.bodyText1,
                  ),
                  dense: true,
                  trailing: CircleAvatar(
                      radius: 20,
                      backgroundColor: (indexedItem.clos == 0)
                          ? Colors.white
                          : Colors.grey.shade800,
                      child: Text(
                        close.toStringAsFixed(0),
                        style: theme.textTheme.subtitle2?.copyWith(
                            color: (indexedItem.clos == 0)
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
                          'PUR(GST): ${formatter.format(indexedItem.purGst)}',
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.only(right: 15),
                        child: Text(
                          'SAL(GST): ${formatter.format(indexedItem.salGst)}',
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                      )
                    ]),
              ),
            ])));
  }
}