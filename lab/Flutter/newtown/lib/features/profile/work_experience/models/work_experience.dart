import 'package:flutter/foundation.dart';

import '/features/other/models/form_entity.dart';

class WorkExperience with ChangeNotifier {
  /* {
      "jobCategory": "35",
      "institutionCat": "1",
      "institutionCatOther": "",
      "institutionSubCat": "1",
      "institutionSubCatOther": "",
      "institutionSubCat2": "7",
      "institutionSubCat2Other": "7",
      "subjects[]": [50],
      "subjectOther": "",
      "role": "0",
      "roleOther": "",
      "instituteName": "MMM",
      "country": "101",
      "state": "41",
      "city": "5583",
      "startDate": "2017-11",
      "endDate": "2020-02",
      "currentCompany": "No",
      "salary": "650000",
      "employmentType": "4",
      "employmentStatus": "",
      "noticePeriod": "0",
      "keyResponsibilites": "res"
      }
   */
  FormEntity? _jobCategory;
  InstitutionType? _institutionType;
  String institutionTypeOther = '';
  InstitutionSubType? _institutionSubType;
  String institutionSubTypeOther = '';
  FormEntity? institutionMinorType;
  String institutionMinorTypeOther = '';
  List<FormEntity> subjects = [];
  String subjectOther = '';
  FormEntity? role;
  String roleOther = '';
  String instituteName = '';
  String salary = '';
  FormEntity? employmentType;
  FormEntity? _country;
  FormEntity? city;
  DateTime? startDate;
  DateTime? endDate;
  FormEntity? noticePeriod;
  String employmentStatus = 'Probation';
  String get currentCompany => isWorkingTillDate ? 'Yes' : 'No';
  String keyResponsibility = '';
  String title = '';
  bool isWorkingTillDate = false;

  final String id;

  WorkExperience({this.id = ''});

  void toggleWorkingTillDate() {
    isWorkingTillDate = !isWorkingTillDate;
    endDate = null;
    _resetNoticePeriod();
    notifyListeners();
  }

  FormEntity? get jobCategory => _jobCategory;
  InstitutionType? get institutionType => _institutionType;
  InstitutionSubType? get institutionSubType => _institutionSubType;
  FormEntity? get country => _country;

  void setJobCategory(FormEntity? value) {
    _resetDependenciesOnJobCategory();
    _jobCategory = value;
    notifyListeners();
  }

  void setInstitutionType(InstitutionType? value) {
    _resetDependenciesOnInstitutionType();
    _institutionType = value;
    notifyListeners();
  }

  void setInstitutionSubType(InstitutionSubType? value) {
    _resetDependenciesOnInstitutionSubType();
    _institutionSubType = value;
    notifyListeners();
  }

  void setCountry(FormEntity? value) {
    if (value != null && value.id != countryId) {
      _resetDependenciesOnCountry();
      _country = value;
      notifyListeners();
    }
  }

  void setStartDate(DateTime? date) {
    startDate = date;
    notifyListeners();
  }

  void setEndDate(DateTime? date) {
    endDate = date;
    notifyListeners();
  }

  void _resetNoticePeriod() {
    noticePeriod = null;
  }

  String get jobCategoryId => _jobCategory?.id ?? '';
  String get institutionTypeId => _institutionType?.id ?? '';
  String get institutionSubTypeId => _institutionSubType?.id ?? '';
  String get institutionMinorTypeId => institutionMinorType?.id ?? '';
  String get subjectsName => subjects.map((e) => e.name).join(', ');
  String get roleId => role?.id ?? '';
  String get employmentTypeId => employmentType?.id ?? '';
  String get countryId => _country?.id ?? '';
  String get cityId => city?.id ?? '';
  String get noticePeriodId => noticePeriod?.id ?? '';

  String get workDuration {
    if (startDate != null && endDate != null) {
      return '${startDate!.year} - ${endDate!.year}';
    } else if (startDate != null) {
      return '${startDate!.year} - Present';
    }
    return 'Unknown';
  }

  String get salaryInLacs {
    double parsedSalary = double.tryParse(salary) ?? 0;
    return '₹ ${(parsedSalary / 100000).toStringAsFixed(2)} LPA';
  }

  bool get shouldUpdate => id.isNotEmpty;
  bool get isCurrentCompany => currentCompany == 'Yes';

  factory WorkExperience.copy(WorkExperience experience) {
    return WorkExperience(id: experience.id)
      .._jobCategory = experience.jobCategory
      .._institutionType = experience.institutionType
      ..institutionTypeOther = experience.institutionTypeOther
      .._institutionSubType = experience.institutionSubType
      ..institutionSubTypeOther = experience.institutionSubTypeOther
      ..institutionMinorType = experience.institutionMinorType
      ..institutionMinorTypeOther = experience.institutionMinorTypeOther
      ..subjects = List.of(experience.subjects)
      ..subjectOther = experience.subjectOther
      ..role = experience.role
      ..roleOther = experience.roleOther
      ..employmentType = experience.employmentType
      ..employmentStatus = experience.employmentStatus
      ..instituteName = experience.instituteName
      ..noticePeriod = experience.noticePeriod
      ..isWorkingTillDate = experience.isWorkingTillDate
      ..title = experience.title
      ..salary = experience.salary
      ..keyResponsibility = experience.keyResponsibility
      ..startDate = experience.startDate
      ..endDate = experience.endDate
      .._country = experience.country
      ..city = experience.city;
  }

  factory WorkExperience.fromJson(Map<String, dynamic> json) {
    return WorkExperience(id: json['experienceID'])
      .._jobCategory = FormEntity.fromJson(json['jobCategoryObj'])
      .._institutionType = InstitutionType.fromJson(json['institutionCatObj'])
      ..institutionTypeOther = json['institutionCatOther'] ?? ''
      .._institutionSubType = json['institutionSubCatObj'] != null
          ? InstitutionSubType.fromJson(json['institutionSubCatObj'])
          : null
      ..institutionSubTypeOther = json['institutionSubCatOther'] ?? ''
      ..institutionMinorType = json['institutionSubCat2Obj'] != null
          ? FormEntity.fromJson(json['institutionSubCat2Obj'])
          : null
      ..institutionMinorTypeOther = json['institutionSubCat2Other'] ?? ''
      ..subjects = json['subjectsObj'] != null
          ? (json['subjectsObj'] as List<dynamic>)
              .map((e) => FormEntity.fromJson(e))
              .toList()
          : <FormEntity>[]
      ..subjectOther = json['subjectOther'] ?? ''
      ..role =
          json['roleObj'] != null ? FormEntity.fromJson(json['roleObj']) : null
      ..roleOther = json['roleOther'] ?? ''
      ..instituteName = json['instituteName']
      ..title = json['title'] ?? ''
      ..startDate = _parseDate(json['startDate'])
      ..endDate = _parseDate(json['endDate'])
      ..isWorkingTillDate = _parseDate(json['endDate']) == null
      ..salary = json['salary']
      ..employmentStatus = json['employmentStatus'] ?? ''
      ..employmentType = EmploymentType.fromJson(json['employmentTypeObj'])
      ..noticePeriod = NoticePeriod.fromJson(json['noticePeriodObj'])
      ..keyResponsibility = json['keyResponsibilites']
      .._country = FormEntity.fromJson(json['countryObj'])
      ..city = FormEntity.fromJson(json['cityObj']);
  }

  static DateTime? _parseDate(String? date) {
    return DateTime.tryParse(date ?? '');
  }

  Map<String, dynamic> toJson() => {
        "jobCategory": jobCategoryId,
        "institutionCat": institutionTypeId,
        "institutionCatOther": institutionTypeOther,
        "institutionSubCat": institutionSubTypeId,
        "institutionSubCatOther": institutionSubTypeOther,
        "institutionSubCat2": institutionMinorTypeId,
        "institutionSubCat2Other": institutionMinorTypeOther,
        "subjects[]": subjects.map((e) => e.id).toList(growable: false),
        "subjectOther": subjectOther,
        "role": roleId,
        "roleOther": roleOther,
        "instituteName": instituteName,
        "country": countryId,
        "city": cityId,
        "startDate": _dateForJson(startDate!),
        "endDate": isWorkingTillDate ? 'NA' : _dateForJson(endDate!),
        "currentCompany": currentCompany,
        "salary": salary,
        "employmentType": employmentTypeId,
        "employmentStatus": employmentStatus,
        "noticePeriod": noticePeriod?.id ?? '',
        "keyResponsibilites": keyResponsibility,
        "title": title,
      };

  String _dateForJson(DateTime date) {
    final year = date.year.toString();
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  void _resetDependenciesOnJobCategory() {
    _resetInstitutionType();
  }

  void _resetInstitutionType() {
    _institutionType = null;
    institutionTypeOther = '';
    _resetDependenciesOnInstitutionType();
  }

  void _resetDependenciesOnInstitutionType() {
    _resetInstitutionSubType();
    _resetRole();
  }

  void _resetInstitutionSubType() {
    _institutionSubType = null;
    institutionSubTypeOther = '';
    _resetDependenciesOnInstitutionSubType();
  }

  void _resetDependenciesOnInstitutionSubType() {
    _resetInstitutionMinorType();
    _resetSubject();
    _resetRole();
  }

  void _resetInstitutionMinorType() {
    institutionMinorType = null;
    institutionMinorTypeOther = '';
  }

  void _resetSubject() {
    subjects.clear();
    subjectOther = '';
  }

  void _resetRole() {
    role = null;
    roleOther = '';
  }

  void _resetDependenciesOnCountry() {
    _resetCities();
  }

  void _resetCities() {
    city = null;
  }
}
