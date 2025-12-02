import '/features/other/models/form_entity.dart';
import '/features/other/services/common_service.dart';
import '../models/job_preference.dart';

class JobPreferenceFormService {
  final JobPreference _jobPreference;

  final JobCategoryService _jobCategoryService;
  final InstitutionTypeService _institutionTypeService;
  final InstitutionSubTypeService _institutionSubTypeService;
  final InstitutionMinorTypeService _institutionMinorTypeService;
  final SubjectService _subjectService;
  final RoleService _roleService;
  final ExperienceService _experienceService;
  final EmploymentTypeService _employmentTypeService;
  final PlaceService _placeService;
  final JobTitleService _jobTitleService;

  JobPreferenceFormService(this._jobPreference)
      : _jobCategoryService = JobCategoryService(),
        _institutionTypeService = InstitutionTypeService(),
        _institutionSubTypeService = InstitutionSubTypeService(),
        _institutionMinorTypeService = InstitutionMinorTypeService(),
        _subjectService = SubjectService(),
        _roleService = RoleService(),
        _experienceService = ExperienceService(),
        _employmentTypeService = EmploymentTypeService(),
        _placeService = PlaceService(),
        _jobTitleService = JobTitleService();

  late List<JobCategory> _jobCategories;
  late List<Experience> _experiences;
  late List<EmploymentType> _employmentTypes;
  late List<Country> _countries;

  List<JobCategory> get jobCategories => _jobCategories;
  List<Experience> get experiences => _experiences;
  List<EmploymentType> get employmentTypes => _employmentTypes;
  List<Country> get countries => _countries;

  // bool get shouldBuildRoleOther =>
  //     _jobPreference.role != null && _jobPreference.role!.isOther;

  bool get shouldBuildRole =>
      _jobPreference.institutionType != null || _jobPreference.role != null;

  // bool get shouldBuildSubjectOther =>
  //     _jobPreference.subject != null && _jobPreference.subject!.isOther;

  bool get shouldBuildSubject =>
      _jobPreference.institutionSubType != null &&
      (_jobPreference.subject != null ||
          _institutionSubTypeService.isNextFieldSubject);

  bool get shouldBuildInstitutionMinorType =>
      _jobPreference.institutionSubType != null &&
      (_jobPreference.institutionMinorType != null ||
          _institutionSubTypeService.isNextFieldInstitutionMinorType);

  bool get shouldBuildInstitutionSubType =>
      _jobPreference.institutionType != null &&
      (_jobPreference.institutionSubType != null ||
          _institutionTypeService.isNextFieldInstitutionSubType);

  bool get shouldBuildInstitutionType =>
      _jobPreference.jobCategory != null ||
      _jobPreference.institutionType != null;

  Future<bool> loadInitialData() async {
    try {
      _jobCategories = await _jobCategoryService.getJobCategories();
      _experiences = await _experienceService.getExperiences();
      _employmentTypes = await _employmentTypeService.getEmploymentTypes();
      final countriesData = await _placeService.getCountries();
      _countries = countriesData.countries;
      if (_jobPreference.countryId.isEmpty) {
        _jobPreference.country = countriesData.defaultCountry;
      }

      return true;
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<List<InstitutionType>> getInstitutionTypes() async {
    final instituteTypes = await _institutionTypeService
        .getInstitutionTypes(_jobPreference.jobCategoryId);

    return instituteTypes.where(_isNotOther).toList();
  }

  // For Job Preference form no 'Other' options allowed in dropdown
  // So filtered out if any with name = 'Other' or 'other'
  bool _isNotOther(FormEntity value) => value.name.toLowerCase() != 'other';

  Future<List<InstitutionSubType>> getInstitutionSubTypes() async {
    final instituteSubTypes =
        await _institutionSubTypeService.getInstitutionSubTypes(
            _jobPreference.jobCategoryId, _jobPreference.institutionTypeId);

    return instituteSubTypes.where(_isNotOther).toList();
  }

  Future<List<InstitutionMinorType>> getInstitutionMinorTypes() async {
    final instituteMinorTypes =
        await _institutionMinorTypeService.getInstitutionMinorTypes(
      _jobPreference.jobCategoryId,
      _jobPreference.institutionTypeId,
      _jobPreference.institutionSubTypeId,
    );

    return instituteMinorTypes.where(_isNotOther).toList();
  }

  Future<List<Subject>> getSubjects() async {
    final subjects = await _subjectService.getSubjects(
      _jobPreference.jobCategoryId,
      _jobPreference.institutionTypeId,
      _jobPreference.institutionSubTypeId,
    );
    return subjects.where(_isNotOther).toList();
  }

  Future<List<Role>> getRoles() async {
    final roles = await _roleService.getRoles(
      _jobPreference.jobCategoryId,
      _jobPreference.institutionTypeId,
    );
    return roles.where(_isNotOther).toList();
  }

  Future<List<City>> getCities() async {
    return await _placeService.getCities(_jobPreference.countryId);
  }

  Future<String> getJobTitle() async {
    return await _jobTitleService.getJobTitle(_jobPreference);
  }
}
