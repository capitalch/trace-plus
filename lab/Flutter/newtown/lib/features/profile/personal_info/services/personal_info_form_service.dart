import 'dart:io';

import 'package:jobs_in_education/enums/upload_file.dart';
import 'package:jobs_in_education/features/profile/personal_info/models/upload_details.dart';

import '/features/other/models/form_entity.dart';
import '/features/other/services/common_service.dart';
import '../models/personal_info.dart';

class PersonalInfoFormService {
  final PersonalInfo _personalInfo;
  final PlaceService _placeService;
  final LanguageService _languageService;
  final FileUploadService _uploadService;

  PersonalInfoFormService(this._personalInfo)
      : _placeService = PlaceService(),
        _languageService = LanguageService(),
        _uploadService = FileUploadService();

  late List<FormEntity> _countries;
  late List<FormEntity> _languages;
  List<FormEntity> get countries => _countries;
  List<FormEntity> get languages => _languages;

  Future<bool> loadInitialData() async {
    try {
      final countriesData = await _placeService.getCountries();
      _countries = countriesData.countries;
      if (_personalInfo.countryId.isEmpty) {
        _personalInfo.updateCountry(countriesData.defaultCountry);
      }

      _languages = await _languageService.getLanguages();

      return true;
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<List<FormEntity>> getCities() async {
    return await _placeService.getCities(_personalInfo.countryId);
  }

  Future<UploadDetails> uploadFile(
      File file, UploadFileType type, String contentType) async {
    return await _uploadService.uploadFile(file, type, contentType);
  }
}
