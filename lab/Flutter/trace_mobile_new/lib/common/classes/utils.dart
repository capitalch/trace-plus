import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/graphql_queries.dart';

class Utils {
  static String currencySymbol(context) {
    Locale local = Localizations.localeOf(context);
    var format = NumberFormat.simpleCurrency(locale: local.toString());
    return (format.currencySymbol);
  }

  static execDataCache(
    GlobalSettings globalSettings,
  ) async {
    var result = await GraphQLQueries.genericView(
        sqlKey: 'getJson_datacache_mobile',
        globalSettings: globalSettings,
        args: {'nowDate': DateTime.now().toIso8601String()});

    Map<String, dynamic> jsonResult =
        (result?.data?['accounts']?['genericView']?['jsonResult']);

    globalSettings.setUnitInfoFinYearsBranches(
        branches: jsonResult['branches'],
        currentFinYearObject: jsonResult['nowFinYearIdDates'],
        finYears: jsonResult['finYears'],
        uInfo: jsonResult['unitInfo']);
  }

  static int getCurrentFinYearId() {
    int month = DateTime.now().month;
    int year = DateTime.now().year;
    if ([1, 2, 3].contains(month)) {
      year = year - 1;
    }
    return (year);
  }

  static DateTime getEndDateOfMonth({int diffMonth = 0}) {
    var now = DateTime.now();
    var ret = DateTime.utc(now.year, now.month + diffMonth + 1, 0);
    return ret;
  }

  static DateTime getStartDateOfMonth({int diffMonth = 0}) {
    var now = DateTime.now();
    var ret = DateTime.utc(now.year, now.month + diffMonth, 1);
    return ret;
  }

  static bool isValidJson(String? j) {
    bool ret = true;
    if (j == null) {
      ret = false;
    } else {
      try {
        json.decode(j);
      } catch (e) {
        ret = false;
      }
    }
    return (ret);
  }

  static void showAlert(
      {required BuildContext context,
      String title = 'Alert',
      required String message}) {
    showDialog(
      context: context,
      builder: (context) {
        return (AlertDialog(
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title),
              InkWell(
                child: const Icon(Icons.close),
                onTap: () {
                  Navigator.pop(context);
                },
              )
            ],
          ),
          content: Text(message),
        ));
      },
    );
  }

  static String toIsoDateString(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  static String toLocalDateString(DateTime date) {
    return DateFormat('dd-MM-yyyy').format(date);
  }

  static String toFormattedNumber(double val) {
    NumberFormat formatter = NumberFormat('###,###.00');
    return formatter.format(val);
  }

  static String toFormattedNumberInLaks(double val) {
    double newVal = double.parse((val / 100000).toStringAsFixed(3));
    NumberFormat formatter = NumberFormat('#,##,#0.00');
    return '${formatter.format(newVal)} L';
  }
}
