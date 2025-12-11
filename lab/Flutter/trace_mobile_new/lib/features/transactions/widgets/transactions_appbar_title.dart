import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/transactions/classes/transactions_state.dart';

class TransactionsAppBarTitle extends StatelessWidget {
  const TransactionsAppBarTitle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.maxFinite,
      height: 40,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              InkWell(
                child: Row(
                  children: [
                    const Icon(
                      Icons.chevron_left,
                      size: 30,
                      color: Colors.indigo,
                    ),
                    Text(
                      'Transactions',
                      style: Theme.of(context).textTheme.headline6,
                    ),
                  ],
                ),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              const SizedBox(width: 5),
              ...getLabelsLayout(context)
            ]),
      ),
    );
  }

  List<Widget> getLabelsLayout(BuildContext context) { 
    var transactionsStateMap = context.read<TransactionsState>().transactionsStateMap;
    var getTransactionsState = context.read<TransactionsState>().getTransactionsState;
    var keys = transactionsStateMap.keys.toList();
    var labelsLayout = keys.map(
      (String key) {
        return Material(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 5),
            child: InkWell(
              splashColor: Theme.of(context).primaryColorLight,
              onTap: () {
                context.read<TransactionsState>().setQueryKey(key);
              },
              borderRadius: BorderRadius.circular(15),
              child: Ink(
                  height: 30,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    
                    color: Colors.grey.shade600,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Center(
                    child: Text(
                      getTransactionsState(key)!.label,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(color: Colors.white),
                    ),
                  )),
            ),
          ),
        );
      },
    ).toList();
    return labelsLayout;
  }
}