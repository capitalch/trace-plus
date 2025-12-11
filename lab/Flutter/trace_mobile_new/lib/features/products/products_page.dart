import 'dart:async';
import 'package:flutter/material.dart';
import 'package:trace_mobile/features/products/widgets/products_app_bar_title.dart';
import 'package:trace_mobile/features/products/widgets/products_list.dart';
import 'package:trace_mobile/features/products/widgets/products_summary.dart';
import 'package:trace_mobile/features/products/widgets/products_tags.dart';

class ProductsPage extends StatelessWidget {
  const ProductsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Future data passed from previous screen
    Future<dynamic> getAllProductsFuture =
        ModalRoute.of(context)!.settings.arguments as Future<dynamic>;

    return Scaffold(
        appBar: AppBar(
            automaticallyImplyLeading: false,
            title: const ProductsAppBarTitle()),
        body: Column(
          children: [
            const ProductsTags(),
            const SizedBox(
              height: 10,
            ),
            Expanded(
              child: FutureBuilder(
                future: getAllProductsFuture,
                builder: (context, snapshot) {
                  switch (snapshot.connectionState) {
                    case ConnectionState.waiting:
                      return Center(
                        child: Text(
                          'Loading....',
                          style: Theme.of(context).textTheme.headline6,
                        ),
                      );
                    default:
                      if (snapshot.hasError) {
                        return Center(
                          child: Text(
                            'Error: ${snapshot.error}',
                            style:
                                TextStyle(color: Theme.of(context).errorColor),
                          ),
                        );
                      } else if (snapshot.hasData) {
                        List<dynamic> dataList = snapshot.data.data?['accounts']
                                ?['genericView'] ??
                            [];
                        if (dataList.isEmpty) {
                          return Center(
                            child: Text(
                              'No data',
                              style: Theme.of(context).textTheme.headline6,
                            ),
                          );
                        } else {
                          return ProductsList(
                            dataList: dataList,
                          );
                        }
                      } else {
                        return Center(
                          child: Text(
                            'No data',
                            style: Theme.of(context).textTheme.headline6,
                          ),
                        );
                      }
                  }
                },
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            const ProductsSummary()
          ],
        ));
  }
}
