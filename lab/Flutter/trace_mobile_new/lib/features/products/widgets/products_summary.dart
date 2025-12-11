import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'package:trace_mobile/common/classes/routes.dart';
import 'package:trace_mobile/features/products/classes/products_search_state.dart';
import 'package:trace_mobile/features/products/classes/products_summary_state.dart';

class ProductsSummary extends StatelessWidget {
  const ProductsSummary({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);
    var formatter = NumberFormat('#,##,000');
    ProductsSearchState productsSearchState =
        Provider.of<ProductsSearchState>(context, listen: false);
    ProductsSummaryState productsSummaryState =
        Provider.of<ProductsSummaryState>(context, listen: true);
    return Container(
        height: 25,
        padding: const EdgeInsets.only(bottom: 2, top: 2, left: 5, right: 15),
        width: double.maxFinite,
        color: Colors.grey.shade300,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              Material(
                child: InkWell(
                    splashColor: Theme.of(context).primaryColorLight,
                    onTap: () {
                      productsSearchState.searchFromTag =
                          ''; // reset the searchText
                      Navigator.pop(context);
                      GlobalSettings globalSettings =
                          Provider.of<GlobalSettings>(context, listen: false);
                      var results = GraphQLQueries.genericView(
                          sqlKey: 'get_products_info',
                          globalSettings: globalSettings,
                          entityName: 'accounts',
                          isMultipleRows: true,
                          args: {'onDate': null, 'isAll': true, 'days': 0});
                      Navigator.pushNamed(context, Routes.products,
                          arguments: results);
                    },
                    child: Ink(
                      color: Colors.grey.shade300,
                      padding: const EdgeInsets.only(right: 10),
                      child: const Icon(Icons.sync,
                          size: 20, color: Colors.lightBlue),
                    )),
              ),
              Text(
                  'Rows: ${formatter.format(productsSummaryState.summaryCount)}', //
                  style: theme.textTheme.bodyText2),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Qty: ${formatter.format(productsSummaryState.summaryClos)}', //
                  style: theme.textTheme.bodyText2),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Value: ${formatter.format(productsSummaryState.summarySum)}', //
                  style: theme.textTheme.bodyText2),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Value(Gst): ${formatter.format(productsSummaryState.summarySumGst)}', //
                  style: theme.textTheme.bodyText2),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Age360 qty: ${formatter.format(productsSummaryState.summaryAge360Qty)}', //
                  style: theme.textTheme.bodyText2),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Age360 value: ${formatter.format(productsSummaryState.summaryAge360Value)}', //
                  style: theme.textTheme.bodyText2),
              const SizedBox(
                width: 15,
              ),
              Text(
                'Age360 value(Gst): ${formatter.format(productsSummaryState.summaryAge360ValueGst)}', //
                style: theme.textTheme.bodyText2,
              ),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Op qty: ${formatter.format(productsSummaryState.summaryOpQty)}'),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Op value: ${formatter.format(productsSummaryState.summaryOpValue)}'),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Op value(Gst): ${formatter.format(productsSummaryState.summaryOpValueGst)}'),
              const SizedBox(
                width: 15,
              ),
              Text(
                  'Diff value: ${formatter.format(productsSummaryState.summaryDiffValue)}'),
                  const SizedBox(
                width: 15,
              ),
              Text(
                  'Diff value(Gst): ${formatter.format(productsSummaryState.summaryDiffValueGst)}'),
            ],
          ),
        ));
  }
}
