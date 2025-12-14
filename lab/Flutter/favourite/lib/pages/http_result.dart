import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/http_provider.dart';
class HttpResult extends StatelessWidget {
  const HttpResult({super.key});

  @override
  Widget build(BuildContext context) {
    final items = context.watch<HttpProvider1>().items;

    return Scaffold(
      appBar: AppBar(title: const Text('HTTP Result')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                const Text(
                  'HTTP Result Page',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text('This page displays the result of the HTTP request.'),
              ],
            ),
          ),
          Expanded(
            child: items.isEmpty
                ? const Center(child: Text('No items to display'))
                : ListView.separated(
                    itemCount: items.length,
                    separatorBuilder: (context, index) => const Divider(height: 0),
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            child: Text('${item.id}'),
                          ),
                          title: Text(item.title),
                          subtitle: Text(
                            item.body,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          trailing: Icon(Icons.arrow_forward),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}