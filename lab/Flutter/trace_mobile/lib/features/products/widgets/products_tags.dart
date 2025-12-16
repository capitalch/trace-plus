import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/data_store.dart';
import 'package:trace_mobile/features/products/classes/products_search_state.dart';
import 'package:trace_mobile/features/products/classes/products_tags_state.dart';

// Used stateless widget beacuse loading of tags data from data store is to be done only once, which is possible in initState of stateless widget
class ProductsTags extends StatefulWidget {
  const ProductsTags({Key? key}) : super(key: key);

  @override
  State<ProductsTags> createState() => _ProductsTagsState();
}

class _ProductsTagsState extends State<ProductsTags> {
  @override
  void initState() {
    super.initState();
    getTagsDataFromStore(context);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 25,
      // color: Colors.grey.shade200,
      width: double.maxFinite,
      child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 15),
          child: Row(children: getTagsList(context))),
    );
  }
}

List<Widget> getTagsList(BuildContext context) {
  ProductsTagsState productsTagsState =
      Provider.of<ProductsTagsState>(context, listen: true);
  List<String> tagsList = productsTagsState.productsTags;
  List<Widget> retList =
      tagsList.map((String e) => getTagWidget(context, e)).toList();
  return retList;
}

Widget getTagWidget(BuildContext context, String tag) {
  ThemeData theme = Theme.of(context);
  ProductsSearchState productsSearchState =
      Provider.of<ProductsSearchState>(context, listen: false);
  ProductsTagsState productsTagsState =
      Provider.of<ProductsTagsState>(context, listen: true);
  return Row(
    children: [
      Material(
        color: Colors.amber.shade100,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          splashColor: Theme.of(context).primaryColorLight,
          onTap: () {
            productsSearchState.searchFromTag = tag;
          },
          child: Ink(
            height: 25,
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
            child: Text(tag, style: theme.textTheme.labelLarge),
          ),
        ),
      ),
      Material(
        child: InkWell(
          splashColor: Theme.of(context).primaryColorLight,
          child: Ink(
            padding: const EdgeInsets.only(right: 15),
            child: const Icon(
              Icons.close,
              size: 23,
            ),
          ),
          onTap: () {
            productsTagsState.removeTag(tag);
          },
        ),
      )
    ],
  );
}

getTagsDataFromStore(BuildContext context) async {
  ProductsTagsState productsTagsState =
      Provider.of<ProductsTagsState>(context, listen: false);
  if (productsTagsState.productsTags.isEmpty) {
    String? tags = await DataStore.getDataFromSecuredStorage('productsTags');
    if ((tags != null) && (tags != '')) {
      List<dynamic> tagsList = json.decode(tags);
      if (tagsList.isNotEmpty) {
        productsTagsState.productsTags = List<String>.from(tagsList);
      }
    }
  }
}

// class ProductsTags1 extends StatelessWidget {
//   const ProductsTags1({Key? key}) : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     getTagsDataFromStore(context);
//     return Container(
//       height: 20,
//       color: Colors.grey.shade200,
//       width: double.maxFinite,
//       child: SingleChildScrollView(
//         scrollDirection: Axis.horizontal,
//         child: Row(children: [
//           const SizedBox(
//             width: 15,
//           ),
//           Row(children: getTagsList(context))
//         ]),
//       ),
//     );
//   }
// }
