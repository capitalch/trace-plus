import 'package:flutter/material.dart';
import 'package:jobs_in_education/utils/snack_bar_message.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import '/features/profile/job_preference/services/job_preferences_provider.dart';
import '/local_storage/token_storage.dart';
import '/routes/route_names.dart';
import '/utils/assets_path.dart';
import '/utils/screen_size.dart';
import '../widgets/jin_logo_with_text.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({
    Key? key,
  }) : super(key: key);
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final TokenStorage tokenStorage = TokenStorage.instance;

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration(seconds: 4), () async {
      // if (await tokenStorage.isTokenExist) {
        await _fetchJobPreferencesAndNavigateToDashboard();
      // } else {
      //   Navigator.pushReplacementNamed(context, RouteNames.onBoarding);
      // }
    });
  }

  Future<void> _fetchJobPreferencesAndNavigateToDashboard() async {
    try {
      // await context.read<JobPreferenceProvider>().fetchJobPreferences();
      Navigator.pushReplacementNamed(context, RouteNames.dashboard);
    } on Exception catch (e) {
      SnackBarMessage.show(context, e.toString(),
          action: SnackBarAction(
            label: 'Retry',
            textColor: Colors.yellow,
            onPressed: _fetchJobPreferencesAndNavigateToDashboard,
          ),
          duration: const Duration(seconds: 10));
    }
  }

  @override
  Widget build(BuildContext context) {
    ScreenSize.init(context);

    return SafeArea(
      child: Scaffold(
        body: Column(
          children: [
            Expanded(
              flex: 3,
              child: JINLogoWithText(
                height: 68,
                width: 231,
              ),
            ),
            Expanded(
              flex: 4,
              child: FadeInImage(
                image: AssetImage(AssetsPath.splashCity),
                placeholder: AssetImage(AssetsPath.placeholderWhite),
              ),
            ),
            Expanded(
              flex: 1,
              child: DefaultTextStyle(
                style: Theme.of(context)
                    .textTheme
                    .bodyLarge!
                    .copyWith(color: Color(0xFF546984)),
                child: FutureBuilder(
                  future: retrieveAppVersion(),
                  builder: (context, snapshot) {
                    if (snapshot.hasError) {
                      return Text("Version: NOT FOUND");
                    }
                    if (snapshot.hasData) {
                      return Center(
                        child: Text(
                          "Version: ${snapshot.data}",
                        ),
                      );
                    } else {
                      return SizedBox();
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<String> retrieveAppVersion() async {
    return await PackageInfo.fromPlatform()
        .then((platform) => platform.version);
  }
}
