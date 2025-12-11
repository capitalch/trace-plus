import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/features/accounts/classes/accounts_bs_pl_state.dart';

class BsplHeader extends StatelessWidget {
  const BsplHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var bsplState = context.read<AccountsBsplState>();
    return Selector<AccountsBsplState, bool>(
      selector: (p0, p1) => p1.isSelectedLeftLabel,
      builder: (context, value, child) {
        return Container(
          width: double.maxFinite,
          color: Colors.grey.shade300,
          padding:
              const EdgeInsets.only(left: 35, top: 5, bottom: 5, right: 15),
          child:
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                  color: value ? Colors.yellow.shade600 : Colors.transparent,
                  border: value
                      ? Border.all(width: 2)
                      : Border.all(width: 0, color: Colors.grey.shade300)),
              child: ElevatedButton(
                  onPressed: () {
                    bsplState.isSelectedLeftLabel = true;
                    bsplState.currentAccType =
                        (bsplState.bsplType == 'bs') ? AccTypes.L : AccTypes.E;
                  },
                  child: Text(bsplState.leftLabel)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                  color: !value ? Colors.yellow.shade600 : Colors.transparent,
                  border: !value
                      ? Border.all(width: 2)
                      : Border.all(width: 0, color: Colors.grey.shade300)),
              child: ElevatedButton(
                  onPressed: () {
                    bsplState.isSelectedLeftLabel = false;
                    bsplState.currentAccType =
                        (bsplState.bsplType == 'bs') ? AccTypes.A : AccTypes.I;
                  },
                  child: Text(bsplState.rightLabel)),
            )
          ]),
        );
      },
    );
  }
}