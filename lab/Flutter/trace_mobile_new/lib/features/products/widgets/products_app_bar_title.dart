import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/data_store.dart';
import 'package:trace_mobile/common/classes/ibuki.dart';
import 'package:trace_mobile/features/products/classes/products_search_state.dart';
import 'package:trace_mobile/features/products/classes/products_tags_state.dart';

class ProductsAppBarTitle extends StatelessWidget {
  const ProductsAppBarTitle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    ProductsSearchState productsSearchState =
        Provider.of<ProductsSearchState>(context, listen: true);
    ProductsTagsState productsTagsState =
        Provider.of<ProductsTagsState>(context, listen: false);
    var controller = TextEditingController();
    controller.value =
        TextEditingValue(text: productsSearchState.searchFromTag);
    (controller.value.text == '')
        ? null
        : Ibuki.debounceEmit(IbukiKeys.productFilerKey, controller.value.text);
    return SizedBox(
      width: double.infinity,
      height: 40,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // back icon
          InkWell(
            child: Row(
              children: [
                const Icon(
                  Icons.chevron_left,
                  size: 30,
                  color: Colors.indigo,
                ),
                Text(
                  'Products',
                  style: Theme.of(context).textTheme.headline6,
                ),
              ],
            ),
            onTap: () {
              productsSearchState.searchFromTag = '';
              List<String> tagsData = productsTagsState.productsTags;
              String serializedData = json.encode(tagsData);
              DataStore.saveDataInSecuredStorage(
                  'productsTags', serializedData);
              Navigator.pop(context);
            },
          ),
          const SizedBox(
            width: 8,
          ),
          // Search box
          Expanded(
              child: Container(
            decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(25)),
            child: TextField(
              controller: controller,
              onChanged: (value) {
                Ibuki.debounceEmit(IbukiKeys.productFilerKey, value);
              },
              decoration: InputDecoration(
                  iconColor: Colors.indigo,
                  prefixIcon: const Icon(
                    Icons.search,
                    size: 20,
                    color: Colors.indigo,
                  ),
                  suffixIcon: IconButton(
                    icon:
                        const Icon(Icons.clear, size: 20, color: Colors.indigo),
                    onPressed: () {
                      controller.clear();
                      Ibuki.debounceEmit(IbukiKeys.productFilerKey, '');
                    },
                  ),
                  hintText: 'Search...',
                  border: InputBorder.none),
            ),
          ))
        ],
      ),
    );
  }
}
