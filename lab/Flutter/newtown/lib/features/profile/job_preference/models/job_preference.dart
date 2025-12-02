import '/features/other/models/form_entity.dart';

class JobPreference {
  JobCategory? jobCategory;
  InstitutionType? institutionType;
  InstitutionSubType? institutionSubType;
  InstitutionMinorType? institutionMinorType;
  Subject? subject;
  String subjectOther = '';
  Role? role;
  String roleOther = '';
  String jobTitle = '';
  String customJobTitle = '';
  Experience? experience;
  String minimumSalary = '';
  EmploymentType? employmentType;
  Country? country;
  List<City> cities = [];

  final String id;

  JobPreference({this.id = ''});

  String get jobCategoryId => jobCategory?.id ?? '';
  String get institutionTypeId => institutionType?.id ?? '';
  String get institutionSubTypeId => institutionSubType?.id ?? '';
  String get institutionMinorTypeId => institutionMinorType?.id ?? '';
  String get subjectId => subject?.id ?? '';
  String get roleId => role?.id ?? '';
  String get experienceId => experience?.id ?? '';
  String get employmentTypeId => employmentType?.id ?? '';
  String get countryId => country?.id ?? '';

  String get citiesName => cities.map((e) => e.name).join(', ');
  String get salaryInLacs {
    double salary = double.tryParse(minimumSalary) ?? 0;
    return '₹ ${(salary / 100000).toStringAsFixed(2)} LPA';
  }

  bool get shouldUpdate => id.isNotEmpty;

  factory JobPreference.copy(JobPreference preference) {
    return JobPreference(id: preference.id)
      ..jobCategory = preference.jobCategory
      ..institutionType = preference.institutionType
      ..institutionSubType = preference.institutionSubType
      ..institutionMinorType = preference.institutionMinorType
      ..subject = preference.subject
      ..subjectOther = preference.subjectOther
      ..role = preference.role
      ..roleOther = preference.roleOther
      ..experience = preference.experience
      ..employmentType = preference.employmentType
      ..jobTitle = preference.jobTitle
      ..customJobTitle = preference.customJobTitle
      ..minimumSalary = preference.minimumSalary
      ..country = preference.country
      ..cities = List.from(preference.cities);
  }

  factory JobPreference.fromJson(Map<String, dynamic> json) {
    //final experience = json['experience'].toString();

    return JobPreference(id: json['preferenceID'])
      ..jobCategory = JobCategory.fromJson(json['jobCategoryObj'])
      ..institutionType = InstitutionType.fromJson(json['institutionCatObj'])
      ..institutionSubType = json['institutionSubCatObj'] != null
          ? InstitutionSubType.fromJson(json['institutionSubCatObj'])
          : null
      ..institutionMinorType = json['institutionSubCat2Obj'] != null
          ? InstitutionMinorType.fromJson(json['institutionSubCat2Obj'])
          : null
      ..subject = json['subjectObj'] != null
          ? Subject.fromJson(json['subjectObj'])
          : null
      ..subjectOther = json['subjectOther'] ?? ''
      ..role = json['roleObj'] != null ? Role.fromJson(json['roleObj']) : null
      ..roleOther = json['roleOther'] ?? ''
      ..jobTitle = json['title']
      ..customJobTitle = json['customTitle'] ?? ''
      ..experience = Experience.fromJson(json['experienceObj'])
      ..minimumSalary = json['minSalary']
      ..employmentType = EmploymentType.fromJson(json['employmentTypeObj'])
      ..country = Country.fromJson(json['countryObj'])
      ..cities = (json['citiesObj'] as List<dynamic>)
          .map((e) => City.fromJson(e))
          .toList();
  }

  Map<String, dynamic> toJson() => {
        "jobCategory": jobCategoryId,
        "institutionCat": institutionTypeId,
        "institutionSubCat": institutionSubTypeId,
        "institutionSubCat2": institutionMinorTypeId,
        "subject": subjectId,
        "subjectOther": subjectOther,
        "role": roleId,
        "roleOther": roleOther,
        "title": jobTitle,
        "customTitle": customJobTitle,
        "experience": experienceId,
        "minSalary": minimumSalary,
        "employmentType": employmentTypeId,
        'is_customTitle': customJobTitle.isEmpty ? '0' : '1',
        "country": countryId,
        "cities[]": cities.map((e) => e.id).toList(),
      };

  void resetDependenciesOnJobCategory() {
    _resetInstitutionType();
  }

  void _resetInstitutionType() {
    institutionType = null;
    resetDependenciesOnInstitutionType();
  }

  void resetDependenciesOnInstitutionType() {
    _resetInstitutionSubType();
    _resetRole();
  }

  void _resetInstitutionSubType() {
    institutionSubType = null;
    resetDependenciesOnInstitutionSubType();
  }

  void resetDependenciesOnInstitutionSubType() {
    _resetInstitutionMinorType();
    _resetSubject();
  }

  void _resetInstitutionMinorType() {
    institutionMinorType = null;
  }

  void _resetSubject() {
    subject = null;
    subjectOther = '';
    jobTitle = '';
  }

  void resetDependenciesOnCountry() {
    _resetCities();
  }

  void _resetCities() {
    cities.clear();
  }

  void _resetRole() {
    role = null;
    roleOther = '';
    jobTitle = '';
  }
}
