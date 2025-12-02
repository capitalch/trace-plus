import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_provider.dart';
import 'package:provider/provider.dart';

import '/api/api.dart';
import '/features/profile/personal_info/services/personal_info_provider.dart';
import '/routes/route_names.dart';
import '/routes/routes.dart';
import '/utils/device.dart';
import '/utils/layout.dart';
import 'features/profile/job_preference/services/job_preferences_provider.dart';
import 'features/profile/work_experience/services/work_experiences_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.white, statusBarIconBrightness: Brightness.dark));
  Api.setDeviceId(await Device.id);
  runApp(JinApp());
}

class JinApp extends StatefulWidget {
  final RouteGenerator routeGenerator = RouteGenerator();

  @override
  _JinAppState createState() => _JinAppState();
}

class _JinAppState extends State<JinApp> {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext ctx, BoxConstraints constraints) {
        LayoutUtil.init(constraints);
        return MultiProvider(
          providers: [
            ChangeNotifierProvider(
                create: (_) => JobPreferenceProvider(), lazy: false),
            ChangeNotifierProvider(
                create: (_) => WorkExperiencesProvider(), lazy: false),
            ChangeNotifierProvider(
                create: (_) => PersonalInfoProvider(), lazy: false),
            ChangeNotifierProvider(
                create: (_) => DashboardProvider(), lazy: false),
          ],
          child: MaterialApp(
            title: 'Jobs In Education',
            debugShowCheckedModeBanner: false,
            theme: _themeData,
            initialRoute: RouteNames.splashScreen,
            onGenerateRoute: widget.routeGenerator.generateRoute,
          ),
        );
      },
    );
  }

  ThemeData get _themeData {
    return ThemeData(
      scaffoldBackgroundColor: Colors.white,
      primarySwatch: _primarySwatch,
      primaryColor: primaryColor,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0.0,
        titleTextStyle: TextStyle(color: Colors.black),
        iconTheme: IconThemeData(color: Colors.black, size: 24.0),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.scale)),
      )),
      textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
              foregroundColor: primaryColor, shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.scale)))),
      iconTheme: IconThemeData(color: Color(0xFF1C1B1B), size: 24),
      textTheme: TextTheme(
        headlineSmall: TextStyle(
          fontSize: 24.scale,
          fontWeight: FontWeight.w600,
          color: Color(0xFF1C1B1B),
        ),
        titleLarge: TextStyle(
          fontSize: 16.scale,
          fontWeight: FontWeight.w500,
          fontFamily: "Inter",
          color: Color(0xFF1C1B1B),
        ),
        bodyLarge: TextStyle(
          fontSize: 14.scale,
          fontWeight: FontWeight.w500,
          fontFamily: "Inter",
          color: Color(0xFF1C1B1B),
        ),
        bodyMedium: TextStyle(
          fontSize: 14.scale,
          fontWeight: FontWeight.w400,
          fontFamily: "Inter",
          color: Color(0xFF546984),
        ),
        titleMedium: TextStyle(
          fontSize: 12.scale,
          fontWeight: FontWeight.w400,
          fontFamily: "Inter",
          color: Color(0xFF1C1B1B),
        ),
        titleSmall: TextStyle(
          fontSize: 8.scale,
          fontWeight: FontWeight.w400,
          fontFamily: "Inter",
          color: Color(0xFF1C1B1B),
        ),
      ),
    );
  }

  static const MaterialColor _primarySwatch = MaterialColor(
    _primaryValue,
    <int, Color>{
      50: Color(0xFF2A5798),
      100: Color(0xFF2A5798),
      200: Color(0xFF2A5798),
      300: Color(0xFF2A5798),
      400: Color(0xFF2A5798),
      500: Color(_primaryValue),
      600: Color(0xFF2A5798),
      700: Color(0xFF2A5798),
      800: Color(0xFF2A5798),
      900: Color(0xFF2A5798),
    },
  );
  static const int _primaryValue = 0xFF2A5798;
  static const primaryColor = Color(_primaryValue);
}
