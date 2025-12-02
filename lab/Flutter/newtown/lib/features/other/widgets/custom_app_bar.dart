import 'package:flutter/material.dart';

class CustomAppBar extends StatelessWidget {
  final double iconSize;
  final String title;
  final List<Widget> actions;

  const CustomAppBar({
    Key? key,
    this.iconSize = 24,
    this.title = '',
    this.actions = const [],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          padding: EdgeInsets.zero,
          iconSize: iconSize,
          alignment: Alignment.centerLeft,
          onPressed: () {
            Navigator.pop(context);
          },
          icon: Icon(
            Icons.arrow_back,
            color: Colors.black,
          ),
        ),
        if (title.isNotEmpty)
          Text(
            title,
            style: Theme.of(context)
                .textTheme
                .titleLarge!
                .copyWith(fontWeight: FontWeight.w600),
          ),
        Spacer(),
        if (actions.isNotEmpty) ...actions,
      ],
    );
  }
}
