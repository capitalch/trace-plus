import 'package:flutter/foundation.dart';

import '/api/api.dart';
import '/local_storage/token_storage.dart';
import '../models/work_experience.dart';

class WorkExperiencesProvider with ChangeNotifier {
  final _api = DioApi();
  final _tokenStorage = TokenStorage.instance;

  List<WorkExperience> _workExperiences = [];
  List<WorkExperience> get workExperiences =>
      List.unmodifiable(_workExperiences);

  WorkExperiencesProvider();

  Future<List<WorkExperience>> getWorkExperiences() async {
    final token = await _tokenStorage.getToken();
    final response = await _api
        .get('/profile/workExperience/get', headers: {'token': token});
    if (response.success) {
      final List<dynamic> data = response.data['data'] ?? [];
      _workExperiences = data.map((e) => WorkExperience.fromJson(e)).toList();
      return _workExperiences;
    }
    throw Exception(response.errorMsg);
  }

  Future<WorkExperience> getSingleWorkExperience(String jobPreferenceId) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.get(
        '/profile/workExperience/get/$jobPreferenceId',
        headers: {'token': token});
    if (response.success) {
      return WorkExperience.fromJson(response.data['data']);
    }
    throw Exception(response.errorMsg);
  }

  Future<bool> addWorkExperience(WorkExperience preference) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.post('/profile/workExperience/add',
        headers: {'token': token}, body: preference.toJson());
    if (response.success) {
      await fetchWorkExperiences();
      return response.success;
    }
    throw Exception(response.errorMsg);
  }

  Future<bool> updateWorkExperience(WorkExperience workExperience) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.put(
      '/profile/workExperience/edit/${workExperience.id}',
      headers: {'token': token},
      body: workExperience.toJson(),
    );
    if (response.success) {
      await fetchWorkExperiences();
      return response.success;
    }
    throw Exception(response.errorMsg);
  }

  Future<bool> deleteWorkExperience(String workExperienceId) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.delete(
      '/profile/workExperience/delete/$workExperienceId',
      headers: {'token': token},
    );
    if (response.success) {
      await fetchWorkExperiences();
    }
    return response.success;
  }

  Future<void> fetchWorkExperiences() async {
    _workExperiences = await getWorkExperiences();
    notifyListeners();
  }

  Future<bool> updateWorkExperienceType(bool isExperienced) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.post(
      '/profile/workExperience/addExperienceType',
      headers: {'token': token},
      body: {"isExperienced": isExperienced ? '1' : '0'},
    );

    return response.success;
  }
}
