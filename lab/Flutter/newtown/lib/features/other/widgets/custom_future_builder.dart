import 'package:flutter/material.dart';

import 'snapshot_error_widget.dart';

typedef DataWidgetBuilder<T> = Widget Function(BuildContext context, T data);
typedef ErrorWidgetBuilder = Widget Function(
    BuildContext context, String error);
typedef LoadingWidgetBuilder = Widget Function();

class CustomFutureBuilder<T> extends StatelessWidget {
  final Future<T> future;
  final DataWidgetBuilder<T> onData;
  final ErrorWidgetBuilder? onError;
  final LoadingWidgetBuilder? onLoading;
  final T? initialData;

  const CustomFutureBuilder({
    Key? key,
    required this.future,
    required this.onData,
    this.onError,
    this.onLoading,
    this.initialData,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
        future: future,
        initialData: initialData,
        builder: (BuildContext context, AsyncSnapshot<T> snapshot) {
          if (snapshot.hasData) {
            return onData(context, snapshot.data!);
          } else if (snapshot.hasError) {
            return onError == null
                ? SnapshotErrorWidget(error: snapshot.error.toString())
                : onError!(context, snapshot.error.toString());
          }
          return onLoading == null
              ? Center(child: CircularProgressIndicator())
              : onLoading!();
        });
  }
}
