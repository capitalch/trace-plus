import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/http_provider.dart';
// import '../providers/http_provider.dart';

class HttpDioTest extends StatelessWidget {
  const HttpDioTest({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('HTTP and Dio Test')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'HTTP and Dio Test Page',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Text('This page is for testing HTTP and Dio packages.'),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                context.read<HttpProvider1>().httpGetItem(
                  "https://jsonplaceholder.typicode.com/posts",
                );
                context.push('/http_result');
              },
              child: Text('Run HTTP Test'),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                context.read<HttpProvider1>().dioGetItems(
                  "https://jsonplaceholder.typicode.com/posts",
                );
                context.push('/http_result');
              },
              child: Text('Run Dio Test'),
            ),
          ],
        ),
      ),
    );
  }
}

// class HttpTest{
//   static final uri = Uri.parse("https://jsonplaceholder.typicode.com/posts");
//   static Future<void> fetchPosts() async {
//     final response = await http.get(uri);
//     if (response.statusCode == 200) {
//       print('Response data: ${response.body}');
//     } else {
//       print('Failed to load posts. Status code: ${response.statusCode}');
//     }
//   }
// }
