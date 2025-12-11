import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/sales/classes/sales_query_props.dart';
import 'package:trace_mobile/features/sales/classes/sales_state.dart';

class SalesAppBar extends StatelessWidget {
  const SalesAppBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
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
                    'Sales',
                    style: Theme.of(context).textTheme.headline6,
                  ),
                ],
              ),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            const SizedBox(
              width: 5,
            ),
            ...getLabelsLayout(context)
          ]),
        ));
  }

  getLabelsLayout(BuildContext context) {
    // SalesState salesState = Provider.of<SalesState>(cntext, listen: false);
    List<SalesQueryProps> queryPropsList =
        QueryProps().getSalesQueryPropsList();
    var labelsLayout = queryPropsList.map(
      (props) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 5),
          child: InkWell(
            splashColor: Theme.of(context).primaryColorLight,
            onTap: () {
              // salesState.salesQueryKey = props.salesQueryKey;
              context.read<SalesState>().salesQueryKey = props.salesQueryKey;
            },
            borderRadius: BorderRadius.circular(10),
            child: Ink(
                height: 30,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.amber.shade100,
                ),
                padding: const EdgeInsets.only(top: 8, left: 10, right: 10),
                child: Text(
                  props.labelName,
                  style: Theme.of(context).textTheme.labelLarge,
                )
                // ),
                ),
          )),
    );

    return labelsLayout;
  }
}
