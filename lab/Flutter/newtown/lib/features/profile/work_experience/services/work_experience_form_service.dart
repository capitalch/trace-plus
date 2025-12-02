import '/features/other/models/form_entity.dart';
import '/features/other/services/common_service.dart';
import '../models/work_experience.dart';

class WorkExperienceFormService {
  final WorkExperience _workExperience;

  final JobCategoryService _jobCategoryService;
  final InstitutionTypeService _institutionTypeService;
  final InstitutionSubTypeService _institutionSubTypeService;
  final InstitutionMinorTypeService _institutionMinorTypeService;
  final SubjectService _subjectService;
  final RoleService _roleService;
  final EmploymentTypeService _employmentTypeService;
  final PlaceService _placeService;
  final NoticePeriodService _noticePeriodService;

  WorkExperienceFormService(this._workExperience)
      : _jobCategoryService = JobCategoryService(),
        _institutionTypeService = InstitutionTypeService(),
        _institutionSubTypeService = InstitutionSubTypeService(),
        _institutionMinorTypeService = InstitutionMinorTypeService(),
        _subjectService = SubjectService(),
        _roleService = RoleService(),
        _employmentTypeService = EmploymentTypeService(),
        _placeService = PlaceService(),
        _noticePeriodService = NoticePeriodService();

  late List<FormEntity> _jobCategories;
  late List<FormEntity> _employmentTypes;
  late List<FormEntity> _countries;
  late List<FormEntity> _noticePeriods;

  List<FormEntity> get jobCategories => _jobCategories;
  List<FormEntity> get employmentTypes => _employmentTypes;
  List<FormEntity> get countries => _countries;
  List<FormEntity> get noticePeriods => _noticePeriods;

  bool get shouldBuildRoleOther =>
      _workExperience.roleId.isNotEmpty && _workExperience.role!.isOther;

  bool get shouldBuildRole {
    if (_workExperience.roleId.isNotEmpty) {
      return true;
    }
    if (_workExperience.institutionSubTypeId.isNotEmpty &&
        _workExperience.institutionSubType!.isOther) {
      return false;
    }
    if (_workExperience.institutionTypeId.isNotEmpty &&
        !_workExperience.institutionType!.isOther) {
      return true;
    }
    return false;
  }
  // (_workExperience.institutionSubTypeId.isNotEmpty &&
  //     !_workExperience.institutionSubType!.isOther) ||
  // (_workExperience.institutionTypeId.isNotEmpty &&
  //     !_workExperience.institutionType!.isOther) ||
  // _workExperience.roleId.isNotEmpty;

  bool get shouldBuildSubjectOther =>
      _workExperience.subjects.isNotEmpty &&
      _workExperience.subjects.any((e) => e.isOther);

  bool get shouldBuildSubject =>
      (_workExperience.institutionSubTypeId.isNotEmpty &&
          !_workExperience.institutionSubType!.isOther) &&
      (_workExperience.subjects.isNotEmpty ||
          _institutionSubTypeService.isNextFieldSubject);

  bool get shouldBuildInstitutionMinorType =>
      (_workExperience.institutionSubTypeId.isNotEmpty &&
          !_workExperience.institutionSubType!.isOther) &&
      (_workExperience.institutionMinorTypeId.isNotEmpty ||
          _institutionSubTypeService.isNextFieldInstitutionMinorType);

  bool get shouldBuildInstitutionSubType =>
      (_workExperience.institutionTypeId.isNotEmpty &&
          !_workExperience.institutionType!.isOther) &&
      (_workExperience.institutionSubTypeId.isNotEmpty ||
          _institutionTypeService.isNextFieldInstitutionSubType);

  bool get shouldBuildInstitutionType =>
      _workExperience.jobCategoryId.isNotEmpty ||
      _workExperience.institutionTypeId.isNotEmpty;

  bool get shouldBuildCity => _workExperience.countryId.isNotEmpty;

  bool get shouldBuildInstitutionTypeOther =>
      _workExperience.institutionTypeId.isNotEmpty &&
      _workExperience.institutionType!.isOther;

  bool get shouldBuildInstitutionSubTypeOther =>
      _workExperience.institutionSubTypeId.isNotEmpty &&
      _workExperience.institutionSubType!.isOther;

  bool get shouldBuildInstitutionMinorTypeOther =>
      _workExperience.institutionMinorTypeId.isNotEmpty &&
      _workExperience.institutionMinorType!.isOther;

  Future<bool> loadInitialData() async {
    try {
      _jobCategories = await _jobCategoryService.getJobCategories();
      _employmentTypes = await _employmentTypeService.getEmploymentTypes();
      _noticePeriods = await _noticePeriodService.getNoticePeriods();
      final countriesData = await _placeService.getCountries();
      _countries = countriesData.countries;
      if (_workExperience.countryId.isEmpty) {
        _workExperience.setCountry(countriesData.defaultCountry);
      }

      return true;
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<List<FormEntity>> getInstitutionTypes() async {
    return await _institutionTypeService
        .getInstitutionTypes(_workExperience.jobCategoryId);
  }

  Future<List<FormEntity>> getInstitutionSubTypes() async {
    return await _institutionSubTypeService.getInstitutionSubTypes(
        _workExperience.jobCategoryId, _workExperience.institutionTypeId);
  }

  Future<List<FormEntity>> getInstitutionMinorTypes() async {
    return await _institutionMinorTypeService.getInstitutionMinorTypes(
      _workExperience.jobCategoryId,
      _workExperience.institutionTypeId,
      _workExperience.institutionSubTypeId,
    );
  }

  Future<List<FormEntity>> getSubjects() async {
    return await _subjectService.getSubjects(
      _workExperience.jobCategoryId,
      _workExperience.institutionTypeId,
      _workExperience.institutionSubTypeId,
    );
  }

  Future<List<FormEntity>> getRoles() async {
    return await _roleService.getRoles(
      _workExperience.jobCategoryId,
      _workExperience.institutionTypeId,
    );
  }

  Future<List<FormEntity>> getCities() async {
    return await _placeService.getCities(_workExperience.countryId);
  }
}
