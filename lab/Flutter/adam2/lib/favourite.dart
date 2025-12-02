import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'main.dart';

class FavoritesPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var appState = context.watch<MyAppState>();

    return 
    Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: 
            appState.favorites.map((e) => Text(e.asLowerCase)).toList(),
            // Text('Favorites Page'),
          
        ),
      // ),
    );
  }
}