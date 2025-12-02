import 'package:flutter/cupertino.dart';

import '/api/api.dart';
import '/local_storage/token_storage.dart';
import '../models/job_preference.dart';

class JobPreferenceProvider with ChangeNotifier {
  final _api = DioApi();
  final _tokenStorage = TokenStorage.instance;

  List<JobPreference> _preferences = [];
  List<JobPreference> get jobPreferences => List.unmodifiable(_preferences);

  JobPreferenceProvider();

  void clearPreferences() {
    _preferences.clear();
    notifyListeners();
  }

  bool get canAddMore => _preferences.length < 4;

  Future<List<JobPreference>> getJobPreferences() async {
    final token = await _tokenStorage.getToken();
    final response =
        await _api.get('/profile/jobPreference/get', headers: {'token': token});
    if (response.success) {
      final List<dynamic> data = response.data['data'] ?? [];
      _preferences = data.map((e) => JobPreference.fromJson(e)).toList();
      return _preferences;
    }
    throw Exception(response.errorMsg);
  }

  Future<JobPreference> getSingleJobPreference(String jobPreferenceId) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.get(
        '/profile/jobPreference/get/$jobPreferenceId',
        headers: {'token': token});
    if (response.success) {
      return JobPreference.fromJson(response.data['data']);
    }
    throw Exception(response.errorMsg);
  }

  Future<bool> addJobPreference(JobPreference preference) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.post('/profile/jobPreference/add',
        headers: {'token': token}, body: preference.toJson());
    if (response.success) {
      await fetchJobPreferences();
      return response.success;
    }
    throw Exception(response.errorMsg);
  }

  Future<bool> updateJobPreference(JobPreference preference) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.put(
      '/profile/jobPreference/edit/${preference.id}',
      headers: {'token': token},
      body: preference.toJson(),
    );
    if (response.success) {
      await fetchJobPreferences();
      return response.success;
    }
    throw Exception(response.errorMsg);
  }

  Future<bool> deleteJobPreference(String jobPreferenceId) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.delete(
      '/profile/jobPreference/delete/$jobPreferenceId',
      headers: {'token': token},
    );
    if (response.success) {
      await fetchJobPreferences();
    }
    return response.success;
  }

  Future<void> fetchJobPreferences() async {
    _preferences = await getJobPreferences();
    notifyListeners();
  }
}
