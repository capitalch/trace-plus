import 'package:flutter/material.dart';
// import 'package:jie_demo/pages/search/search_page.dart';

class SearchFloatingButton extends StatelessWidget {
  const SearchFloatingButton({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      elevation: 0.0,
      mini: true,
      onPressed: () {
        // Navigator.push(context, MaterialPageRoute(builder: (_) => SearchPage()));
      },
      child: Icon(Icons.search),
    );
  }
}
