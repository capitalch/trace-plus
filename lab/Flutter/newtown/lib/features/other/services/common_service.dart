import 'dart:io';

import 'package:jobs_in_education/enums/upload_file.dart';
import 'package:jobs_in_education/features/profile/personal_info/models/upload_details.dart';
import 'package:jobs_in_education/local_storage/token_storage.dart';

import '/api/api.dart';
import '/features/profile/job_preference/models/job_preference.dart';
import '../models/countries.dart';
import '../models/form_entity.dart';

abstract class CommonService {
  final _api = DioApi();
}

class JobCategoryService extends CommonService {
  List<JobCategory> _jobCategories = [];

  Future<List<JobCategory>> getJobCategories() async {
    if (_jobCategories.isNotEmpty) {
      return _jobCategories;
    }

    final response = await _api.get('/common/jobCategories');
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      _jobCategories = data.map((e) => JobCategory.fromJson(e)).toList();
      return _jobCategories;
    }
    throw Exception(response.errorMsg);
  }
}

class InstitutionTypeService extends CommonService {
  List<InstitutionType> _institutionTypes = [];
  List<String> _nextFields = [];
  String _previousId = '';

  bool get isNextFieldInstitutionSubType =>
      _nextFields.contains('INSTITUTION_SUB_TYPE');

  Future<List<InstitutionType>> getInstitutionTypes(
      String jobCategoryId) async {
    if (_previousId == jobCategoryId) {
      return _institutionTypes;
    }

    final body = {'jobCategoryID': jobCategoryId};
    final response = await _api.post('/common/institutionTypes', body: body);
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      _institutionTypes = data.map((e) => InstitutionType.fromJson(e)).toList();

      final List<dynamic> fields = response.data['nextfield'];
      _nextFields = fields.map((e) => e.toString()).toList();

      _previousId = jobCategoryId;

      return _institutionTypes;
    }
    throw Exception(response.errorMsg);
  }
}

class InstitutionSubTypeService extends CommonService {
  List<InstitutionSubType> _institutionSubTypes = [];
  List<String> _nextFields = [];
  String _previousId = '';

  bool get isNextFieldInstitutionMinorType =>
      _nextFields.contains('INSTITUTION_MINOR_TYPE');
  bool get isNextFieldSubject => _nextFields.contains('SUBJECT');
  bool get isNextFieldRole => _nextFields.contains('ROLE');

  Future<List<InstitutionSubType>> getInstitutionSubTypes(
      String jobCategoryID, String institutionTypeId) async {
    final id = '$jobCategoryID-$institutionTypeId';

    if (_previousId == id) {
      return _institutionSubTypes;
    }

    final body = {
      "groupID": institutionTypeId == '6' ? '1' : '0',
      "jobCategoryID": jobCategoryID,
      "institutionTypeID": institutionTypeId
    };
    final response = await _api.post('/common/institutionSubTypes', body: body);
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      _institutionSubTypes =
          data.map((e) => InstitutionSubType.fromJson(e)).toList();

      final List<dynamic> fields = response.data['nextfield'];
      _nextFields = fields.map((e) => e.toString()).toList();

      _previousId = id;

      return _institutionSubTypes;
    }
    throw Exception(response.errorMsg);
  }
}

class InstitutionMinorTypeService extends CommonService {
  Map<String, List<InstitutionMinorType>> _institutionMinorTypes = {};

  Future<List<InstitutionMinorType>> getInstitutionMinorTypes(
      String jobCategoryID,
      String institutionTypeId,
      String institutionSubTypeId) async {
    final key = '$jobCategoryID-$institutionTypeId-$institutionSubTypeId';

    if (_institutionMinorTypes.containsKey(key)) {
      return _institutionMinorTypes[key]!;
    }

    final body = {
      "jobCategoryID": jobCategoryID,
      "institutionTypeID": institutionTypeId,
      "institutionSubTypeID": institutionSubTypeId,
    };

    final response =
        await _api.post('/common/institutionMinorTypes', body: body);
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      final minorTypes =
          data.map((e) => InstitutionMinorType.fromJson(e)).toList();
      _institutionMinorTypes.addAll({key: minorTypes});
      return minorTypes;
    }
    throw Exception(response.errorMsg);
  }
}

class SubjectService extends CommonService {
  Map<String, List<Subject>> _subjects = {};

  Future<List<Subject>> getSubjects(String jobCategoryID,
      String institutionTypeId, String institutionSubTypeId) async {
    final key = '$jobCategoryID-$institutionTypeId-$institutionSubTypeId';
    if (_subjects.containsKey(key)) {
      return _subjects[key]!;
    }

    final body = {
      "jobCategoryID": jobCategoryID,
      "institutionTypeID": institutionTypeId,
      "institutionSubTypeID": institutionSubTypeId,
    };
    final response = await _api.post('/common/subjects', body: body);
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      final subjects = data.map((e) => Subject.fromJson(e)).toList();
      _subjects.addAll({key: subjects});
      return subjects;
    }
    throw Exception(response.errorMsg);
  }
}

class RoleService extends CommonService {
  Map<String, List<Role>> _roles = {};

  Future<List<Role>> getRoles(
      String jobCategoryId, String institutionTypeId) async {
    final key = '$jobCategoryId-$institutionTypeId';
    if (_roles.containsKey(key)) {
      return _roles[key]!;
    }

    final body = {
      "jobCategoryID": jobCategoryId,
      "institutionTypeID": institutionTypeId,
    };
    final response = await _api.post('/common/roles', body: body);
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      final roles = data.map((e) => Role.fromJson(e)).toList();
      _roles.addAll({key: roles});
      return roles;
    }
    throw Exception(response.errorMsg);
  }
}

class ExperienceService extends CommonService {
  List<Experience> _experience = [];

  Future<List<Experience>> getExperiences() async {
    if (_experience.isNotEmpty) {
      return _experience;
    }

    final response = await _api.get('/common/relevantExperience');
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      _experience = data.map((e) => Experience.fromJson(e)).toList();
      return _experience;
    }
    throw Exception(response.errorMsg);
  }
}

class EmploymentTypeService extends CommonService {
  List<EmploymentType> _employmentTypes = [];

  Future<List<EmploymentType>> getEmploymentTypes() async {
    if (_employmentTypes.isNotEmpty) {
      return _employmentTypes;
    }

    final response = await _api.get('/common/employmentType');
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      return data.map((e) => EmploymentType.fromJson(e)).toList();
    }
    throw Exception(response.errorMsg);
  }
}

class PlaceService extends CommonService {
  Countries? _countries;
  Map<String, List<City>> _cities = {};

  Future<Countries> getCountries() async {
    if (_countries != null) {
      return _countries!;
    }

    final response = await _api.get('/common/countries');
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      final countries = data.map((e) => Country.fromJson(e)).toList();
      final defaultCountry = Country.fromJson(response.data['default']);
      _countries =
          Countries(countries: countries, defaultCountry: defaultCountry);
      return _countries!;
    }
    throw Exception(response.errorMsg);
  }

  Future<List<City>> getCities(String countryId) async {
    if (_cities.containsKey(countryId)) {
      return _cities[countryId]!;
    }

    final response = await _api.get('/common/countryCities/$countryId');
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      final cities = data.map((e) => City.fromJson(e)).toList();
      _cities.addAll({countryId: cities});
      return cities;
    }
    throw Exception(response.errorMsg);
  }
}

class JobTitleService extends CommonService {
  Future<String> getJobTitle(JobPreference preference) async {
    final body = {
      "jobCategoryID": preference.jobCategoryId,
      "institutionTypeID": preference.institutionTypeId,
      "institutionSubTypeID": preference.institutionSubTypeId,
      "institutionMinorTypeID": preference.institutionMinorTypeId,
      "subjectID": preference.subjectId,
      "subjectOther": preference.subjectOther,
      "roleID": preference.roleId,
      "roleOther": preference.roleOther,
      "experience": preference.experienceId,
      "employmentType": preference.employmentTypeId,
      "country": preference.countryId,
      "cities[]": preference.cities.map((e) => e.id).toList(),
    };
    final response = await _api.post('/common/generateTitle', body: body);
    if (response.success) {
      return response.data['data'].toString();
    }
    return '';
  }
}

class NoticePeriodService extends CommonService {
  List<NoticePeriod> _noticePeriods = [];

  Future<List<NoticePeriod>> getNoticePeriods() async {
    if (_noticePeriods.isNotEmpty) {
      return _noticePeriods;
    }

    final response = await _api.get('/common/noticePeriods');
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      _noticePeriods = data.map((e) => NoticePeriod.fromJson(e)).toList();
      return _noticePeriods;
    }
    throw Exception(response.errorMsg);
  }
}

class LanguageService extends CommonService {
  List<Language> _languages = [];

  Future<List<Language>> getLanguages() async {
    if (_languages.isNotEmpty) {
      return _languages;
    }

    final response = await _api.get('/common/languages');
    if (response.success) {
      final List<dynamic> data = response.data['data'];
      _languages = data.map((e) => Language.fromJson(e)).toList();
      return _languages;
    }
    throw Exception(response.errorMsg);
  }
}

class FileUploadService extends CommonService {
  late String _uploadedKey;
  final _tokenStorage = TokenStorage.instance;

  Future<UploadDetails> uploadFile(
      File file, UploadFileType type, String contentType) async {
    try {
      String uploadUrl = await _getUploadUrl(type);
      await _api.uploadFile(uploadUrl, file, contentType);

      final fileUrl = await _getFileUrl(_uploadedKey);
      return UploadDetails(fileKey: _uploadedKey, fileUrl: fileUrl);
    } on Exception catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<String> _getUploadUrl(UploadFileType type) async {
    final token = await _tokenStorage.getToken();

    final response = await _api.post(
      '/common/getS3UploadUrl',
      headers: {'token': token},
      body: {'uploaderKey': type.string},
    );

    if (response.success) {
      _uploadedKey = response.data['data']['fileKey'];
      return response.data['data']['url'];
    } else {
      throw Exception(response.errorMsg);
    }
  }

  Future<String> _getFileUrl(String fileKey) async {
    final token = await _tokenStorage.getToken();

    final response = await _api.post(
      '/common/getS3ViewUrl',
      headers: {'token': token},
      body: {'fileKey': fileKey},
    );

    if (response.success) {
      return response.data['data'];
    } else {
      throw Exception(response.errorMsg);
    }
  }
}
