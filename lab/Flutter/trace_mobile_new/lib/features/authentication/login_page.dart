import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';
import 'dart:convert' show utf8, base64;
import 'dart:convert';
import 'package:trace_mobile/common/classes/messages.dart';
import 'package:trace_mobile/common/classes/routes.dart';
import 'package:trace_mobile/common/classes/utils.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    TextEditingController nameController = TextEditingController();
    TextEditingController passwordController = TextEditingController();

    return Scaffold(
      backgroundColor: Theme.of(context).backgroundColor,
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: ListView(children: <Widget>[
          Container(
              alignment: Alignment.center,
              child: Text(
                'Trace',
                style: Theme.of(context)
                    .textTheme
                    .headline2
                    ?.copyWith(color: Colors.indigo),
              )),
          Container(
            alignment: Alignment.center,
            padding: const EdgeInsets.only(top: 30),
            child: Text(
              'Login',
              style: Theme.of(context)
                  .textTheme
                  .headline4
                  ?.copyWith(color: Colors.indigo),
            ),
          ),
          Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.only(top: 20),
              child: TextField(
                  autocorrect: false,
                  controller: nameController,
                  decoration: const InputDecoration(
                      border: OutlineInputBorder(), labelText: 'User name'),
                  style: const TextStyle(fontSize: 20))),
          Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.only(top: 20),
              child: TextField(
                  obscureText: true,
                  controller: passwordController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Password',
                  ),
                  style: const TextStyle(fontSize: 20))),
          Container(
              height: 50,
              margin: const EdgeInsets.only(top: 50),
              child: ElevatedButton(
                  child: const Text('Login'),
                  onPressed: () => onLoginPressed(
                      context, nameController, passwordController))),
        ]),
      ),
    );
    // );
  }

  void onLoginPressed(context, nameController, passwordController) async {
    try {
      var globalSettings = Provider.of<GlobalSettings>(context, listen: false);
      String? uid = nameController.value.text;
      String? pwd = passwordController.value.text;
      if ((uid == null) || (uid.isEmpty) || (pwd == null) || (pwd.isEmpty)) {
        Utils.showAlert(
            context: context, message: Messages.errEmpty, title: 'Error');
        return;
      }
      var creds = [uid, ':', pwd];
      var credentials = base64.encode(utf8.encode(creds.join()));

      var result = await globalSettings.graphQLLoginClient
          ?.query(QueryOptions(
              document: GraphQLQueries.login(credentials),
              operationName: 'login'))
          .timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Timeout error');
        },
      );

      var loginData = result?.data?['authentication']['doLogin'];

      if (loginData == null) {
        globalSettings.resetLoginData();
        Utils.showAlert(
            context: context, title: 'Error', message: Messages.errLogin);
        showSnackBar(context);
        return;
      }

      List<dynamic>? buCodesWithPermissionsTemp =
          loginData['buCodesWithPermissions'];
      List<Map<String, dynamic>>? buCodesWithPermissions =
          buCodesWithPermissionsTemp?.cast<Map<String, dynamic>>().toList();
      Iterable? bues = buCodesWithPermissions?.map((e) => e['buCode']);
      List<dynamic>? buCodes = bues?.cast<dynamic>().toList();
      loginData['buCodes'] = buCodes;
      loginData['buCodesWithPermissions'] = buCodesWithPermissionsTemp;
      globalSettings.setLoginData(loginData);
      Navigator.pushReplacementNamed(context, Routes.dashBoard, arguments: Utils.execDataCache(globalSettings));
      // Utils.execDataCache(globalSettings);
    } catch (error) {
      Utils.showAlert(context: context, message: Messages.errInternetLogin);
    }
  }

  void showSnackBar(context) {
    final snackBar = SnackBar(
      content: const Text('Invalid login'),
      backgroundColor: Theme.of(context).errorColor,
      duration: const Duration(seconds: 5),
      action: SnackBarAction(
        label: 'dismiss',
        onPressed: () {
          Navigator.pop(context);
        },
      ),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}
