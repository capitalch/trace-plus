import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'auth_service.dart';

abstract class SocialAuthProvider {
  late SocialAuthCredential _userCredential;

  SocialAuthCredential get getUserCredential => _userCredential;

  Future<SocialAuthCredential> authenticate() async {
    _userCredential = await _authenticateUser();
    return _userCredential;
  }

  Future<SocialAuthCredential> _authenticateUser();

  Future<dynamic> logout();
}

class FacebookAuthProvider extends SocialAuthProvider {
  @override
  Future<SocialAuthCredential> _authenticateUser() async {
    final List<String> requiredPermissions = ["public_profile", "email"];
    // Check if User is already logged in
    final existingAccessToken = await FacebookAuth.i.accessToken;
    if (existingAccessToken != null) {
      // Token exists, use it (FacebookAuth handles expiration internally)
      return await _createAuthCredentialForLogin(existingAccessToken);
    }

    final loginResult =
        await FacebookAuth.instance.login(permissions: requiredPermissions);

    switch (loginResult.status) {
      case LoginStatus.success:
        final accessToken = loginResult.accessToken!;
        return await _createAuthCredentialForLogin(accessToken);

      case LoginStatus.cancelled:
        return SocialAuthCredential(
          errorResponse: AuthResponse.error(
              errorCode: "FB_CANCELLED",
              msg: loginResult.message ??
                  "You cancelled Facebook authentication"),
        );
      case LoginStatus.failed:
        return SocialAuthCredential(
          errorResponse: AuthResponse.error(
              errorCode: "FB_FAILED",
              msg: loginResult.message ?? "Facebook authentication failed"),
        );
      case LoginStatus.operationInProgress:
        return SocialAuthCredential(
          errorResponse: AuthResponse.error(
              errorCode: "FB_OIP",
              msg:
                  loginResult.message ?? "Facebook authentication in progress"),
        );
    }
  }

  /// Before calling check that FacebookAuth.instance.accessToken != null,
  /// means that ensure user is logged in with Facebook.
  Future<SocialAuthCredential> _createAuthCredentialForLogin(
      AccessToken accessToken) async {
    final Map<String, dynamic> userData = await FacebookAuth.instance
        .getUserData(
            fields: "id,first_name,last_name,picture.width(200),email");

    String getImageUrl() {
      if (userData.containsKey("picture")) {
        if (userData["picture"].containsKey("data")) {
          if (userData["picture"]["data"].containsKey("url")) {
            return userData["picture"]["data"]["url"] ?? "";
          }
        }
      }
      return "";
    }

    final cred = SocialAuthCredential(
        isAuthenticated: true,
        authToken: accessToken.tokenString,
        email: userData["email"],
        firstName: userData["first_name"],
        lastName: userData["last_name"],
        mobile: null,
        uid: userData["id"],
        imageUrl: getImageUrl(),
        rawData: userData);
    debugPrint(cred.toJson().toString());
    return cred;
  }

  @override
  Future<void> logout() async {
    return await FacebookAuth.i.logOut();
  }
}

class GoogleAuthProvider extends SocialAuthProvider {
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  @override
  Future<SocialAuthCredential> _authenticateUser() async {
    try {
      final user = await _googleSignIn.authenticate();
      return await _createAuthCredentialForLogin(user);
    } on PlatformException catch (_) {
      return _onAuthenticationFailure(
          msg: 'Network Error!\nCheck your internet connection and try again');
    } on Exception catch (_) {
      return _onAuthenticationFailure();
    }
  }

  SocialAuthCredential _onAuthenticationFailure(
      {String msg = "Google authentication failed"}) {
    return SocialAuthCredential(
      errorResponse: AuthResponse.error(errorCode: "GOOGLE_FAILED", msg: msg),
    );
  }

  Future<SocialAuthCredential> _createAuthCredentialForLogin(
      GoogleSignInAccount user) async {
    final auth = user.authentication;
    final String accessToken = auth.idToken ?? "Not Available";
    final splittedDisplayName = (user.displayName ?? "").split(" ");
    final firstName = splittedDisplayName.isNotEmpty
        ? splittedDisplayName
            .sublist(0, splittedDisplayName.length - 1)
            .join(" ")
        : "";
    final cred = SocialAuthCredential(
      isAuthenticated: true,
      authToken: accessToken,
      email: user.email,
      firstName: firstName,
      lastName: splittedDisplayName.last,
      mobile: null,
      uid: user.id,
      imageUrl: user.photoUrl ?? "",
    );
    debugPrint(cred.toJson().toString());
    return cred;
  }

  @override
  Future<void> logout() async {
    await _googleSignIn.disconnect();
  }
}

class SocialAuthCredential {
  final String authToken;
  final String uid;
  final String firstName;
  final String lastName;
  final String email;
  final String mobile;
  final String imageUrl;
  final Map<String, dynamic> rawData;
  final bool isAuthenticated;
  final AuthResponse? errorResponse;

  SocialAuthCredential(
      {this.isAuthenticated = false,
      String? authToken,
      String? uid,
      String? firstName,
      String? lastName,
      String? email,
      String? mobile,
      String? imageUrl,
      Map<String, dynamic>? rawData,
      this.errorResponse})
      : authToken = authToken ?? "",
        uid = uid ?? "",
        firstName = firstName ?? "",
        lastName = lastName ?? "",
        email = email ?? "",
        mobile = mobile ?? "",
        imageUrl = imageUrl ?? "",
        rawData = rawData ?? {};

  Map<String, dynamic> toJson() => {
        "access_token": authToken,
        "uid": uid,
        "full_name": "$firstName $lastName",
        "email": email,
        "mobile": mobile,
        "image_url": imageUrl,
        "raw_data": rawData,
      };
}
