import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '/features/other/models/form_entity.dart';
import '/features/other/widgets/custom_app_bar.dart';
import '/features/other/widgets/custom_future_builder.dart';
import '/features/other/widgets/custom_radio.dart';
import '/features/other/widgets/custom_text_field.dart';
import '/features/other/widgets/dropdown.dart';
import '/features/other/widgets/dropdown_error_widget.dart';
import '/features/other/widgets/iso_style_date_picker.dart';
import '/features/other/widgets/multi_select_dropdown.dart';
import '/features/other/widgets/primary_button.dart';
import '/routes/route_names.dart';
import '/utils/loading_indicator.dart';
import '/utils/screen_size.dart';
import '/utils/snack_bar_message.dart';
import '/utils/validator.dart';
import '../models/work_experience.dart';
import '../services/work_experience_form_service.dart';
import '../services/work_experiences_provider.dart';

class WorkExperienceFormScreen extends StatefulWidget {
  final WorkExperience experience;
  WorkExperienceFormScreen({Key? key, required this.experience})
      : super(key: key);

  @override
  _WorkExperienceFormScreenState createState() =>
      _WorkExperienceFormScreenState();
}

class _WorkExperienceFormScreenState extends State<WorkExperienceFormScreen> {
  late final WorkExperience _experience;
  late final WorkExperienceFormService _formService;
  final _formKey = GlobalKey<FormState>();

  final _screenSize = ScreenSize.instance;

  bool _hasFetchedInitialFormData = false;

  static const _sizedBox = SizedBox();

  SizedBox _buildSizedBox() => _sizedBox;

  @override
  void initState() {
    super.initState();
    _experience = WorkExperience.copy(widget.experience);
    _formService = WorkExperienceFormService(_experience);

    _experience.addListener(_reBuild);
  }

  void _reBuild() => setState(() {});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildCustomAppBar(),
              _buildTitle(),
              SizedBox(height: _screenSize.height(1.5)),
              Expanded(
                child: !_hasFetchedInitialFormData
                    ? CustomFutureBuilder<bool>(
                        future: _formService.loadInitialData(),
                        onData: (_, data) {
                          _hasFetchedInitialFormData = true;
                          return _buildForm();
                        },
                      )
                    : _buildForm(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Text _buildTitle() {
    return const Text(
        'Please enlist all your job experiences from the latest / current one to the first one');
  }

  Widget _buildCustomAppBar() {
    return CustomAppBar(title: 'Work Experience');
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          children: [
            _buildJobCategory(),
            if (_formService.shouldBuildInstitutionType)
              _buildInstitutionType(),
            if (_formService.shouldBuildInstitutionTypeOther)
              _buildInstitutionTypeOther(),
            if (_formService.shouldBuildInstitutionSubType)
              _buildInstitutionSubType(),
            if (_formService.shouldBuildInstitutionSubTypeOther)
              _buildInstitutionSubTypeOther(),
            if (_formService.shouldBuildInstitutionMinorType)
              _buildInstitutionMinorType(),
            if (_formService.shouldBuildInstitutionMinorTypeOther)
              _buildInstitutionMinorTypeOther(),
            if (_formService.shouldBuildSubject) _buildSubject(),
            if (_formService.shouldBuildSubjectOther) _buildSubjectOther(),
            if (_formService.shouldBuildRole) _buildRole(),
            if (_formService.shouldBuildRoleOther) _buildRoleOther(),
            _buildInstituteName(),
            _buildJobTitle(),
            _buildStartDate(),
            _buildWorkingTillDate(),
            SizedBox(height: 14),
            if (!_experience.isWorkingTillDate) _buildEndDate(),
            _buildSalary(),
            _buildEmploymentType(),
            if (_experience.isWorkingTillDate) _buildNoticePeriod(),
            if (_experience.isWorkingTillDate) _buildEmploymentStatus(),
            _buildCountry(),
            if (_formService.shouldBuildCity) _buildCity(),
            _buildKeyResponsibility(),
            _buildSaveButton(),
            SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildJobCategory() {
    return FormDropdown(
      key: ValueKey('JC'),
      context: context,
      label: 'Job Category',
      items: _formService.jobCategories,
      initialVal: _experience.jobCategory,
      onChanged: _experience.setJobCategory,
    );
  }

  Widget _buildInstitutionType() {
    return CustomFutureBuilder<List<FormEntity>>(
      future: _formService.getInstitutionTypes(),
      onData: (_, data) {
        return data.isNotEmpty
            ? FormDropdown(
                key: ValueKey('IT-${_experience.jobCategoryId}'),
                context: context,
                label: 'Institute Type',
                items: data,
                initialVal: _experience.institutionType,
                onChanged: (val) =>
                    _experience.setInstitutionType(val as InstitutionType),
              )
            : _sizedBox;
      },
      onLoading: _buildSizedBox,
      onError: (_, error) => DropdownErrorWidget(error: error),
    );
  }

  Widget _buildInstitutionTypeOther() {
    return CustomTextField(
      key: ValueKey('ITOther-${_experience.institutionTypeOther}'),
      initialValue: _experience.institutionTypeOther,
      labelText: 'Specify Institute Type',
      onChanged: (val) => _experience.institutionTypeOther = val,
      validator:
          AlphabetsSpaceValidator(emptyMsg: 'Please enter Institute Type'),
    );
  }

  Widget _buildInstitutionSubType() {
    return CustomFutureBuilder<List<FormEntity>>(
      future: _formService.getInstitutionSubTypes(),
      onData: (_, data) {
        return data.isNotEmpty
            ? FormDropdown(
                context: context,
                key: ValueKey('IST-${_experience.institutionTypeId}'),
                label: _experience.institutionType!.institutionSubTypeLabel,
                items: data,
                initialVal: _experience.institutionSubType,
                onChanged: (val) => _experience
                    .setInstitutionSubType(val as InstitutionSubType),
              )
            : _sizedBox;
      },
      onLoading: _buildSizedBox,
      onError: (_, error) => DropdownErrorWidget(error: error),
    );
  }

  Widget _buildInstitutionSubTypeOther() {
    return CustomTextField(
      key: ValueKey('ISTOther-${_experience.institutionSubTypeOther}'),
      initialValue: _experience.institutionSubTypeOther,
      labelText:
          'Specify ${_experience.institutionType!.institutionSubTypeLabel}',
      onChanged: (val) => _experience.institutionSubTypeOther = val,
      validator: AlphabetsSpaceValidator(
          emptyMsg:
              'Please enter ${_experience.institutionType!.institutionSubTypeLabel}'),
    );
  }

  Widget _buildInstitutionMinorType() {
    return CustomFutureBuilder<List<FormEntity>>(
      future: _formService.getInstitutionMinorTypes(),
      onData: (_, data) {
        return data.isNotEmpty
            ? FormDropdown(
                context: context,
                key: ValueKey('IMT-${_experience.institutionSubTypeId}'),
                label:
                    _experience.institutionSubType!.institutionMinorTypeLabel,
                items: data,
                initialVal: _experience.institutionMinorType,
                onChanged: (val) => _experience.institutionMinorType = val,
              )
            : _sizedBox;
      },
      onLoading: _buildSizedBox,
      onError: (_, error) => DropdownErrorWidget(error: error),
    );
  }

  Widget _buildInstitutionMinorTypeOther() {
    return CustomTextField(
      key: ValueKey('IMTOther-${_experience.institutionMinorTypeOther}'),
      initialValue: _experience.institutionMinorTypeOther,
      labelText:
          'Specify ${_experience.institutionSubType!.institutionMinorTypeLabel}',
      onChanged: (val) => _experience.institutionMinorTypeOther = val,
      validator: AlphabetsSpaceValidator(
        emptyMsg:
            'Please enter ${_experience.institutionSubType!.institutionMinorTypeLabel}',
      ),
    );
  }

  Widget _buildSubject() {
    return CustomFutureBuilder<List<FormEntity>>(
      future: _formService.getSubjects(),
      onData: (_, data) {
        return data.isNotEmpty
            ? MultiSelectDropdown(
                context: context,
                key: ValueKey('Subject-${_experience.institutionSubTypeId}'),
                label: 'Subject',
                items: data,
                maxSelectable: 5,
                initialVal:
                    _experience.subjects.isEmpty ? null : _experience.subjects,
                onChanged: (subjects) => _experience.subjects = subjects ?? [],
              )
            : _sizedBox;
      },
      onLoading: _buildSizedBox,
      onError: (_, error) => DropdownErrorWidget(error: error),
    );
  }

  Widget _buildSubjectOther() {
    return CustomTextField(
      key: ValueKey('SubjectOther-${_experience.subjectOther}'),
      initialValue: _experience.subjectOther,
      labelText: 'Specify Subject',
      onChanged: (val) => _experience.subjectOther = val,
      validator: AlphabetsSpaceValidator(emptyMsg: 'Please enter Subject'),
    );
  }

  Widget _buildRole() {
    return CustomFutureBuilder<List<FormEntity>>(
      future: _formService.getRoles(),
      onData: (context, data) {
        return data.isNotEmpty
            ? FormDropdown(
                context: context,
                key: ValueKey('Role-${_experience.institutionTypeId}'),
                label: 'Role',
                items: data,
                initialVal: _experience.role,
                onChanged: (val) => _experience.role = val,
              )
            : SizedBox();
      },
      onLoading: _buildSizedBox,
      onError: (_, error) => DropdownErrorWidget(error: error),
    );
  }

  Widget _buildRoleOther() {
    return CustomTextField(
      key: ValueKey('RoleOther-${_experience.roleOther}'),
      initialValue: _experience.roleOther,
      labelText: 'Specify Role',
      onChanged: (val) => _experience.roleOther = val,
      validator: AlphabetsSpaceValidator(emptyMsg: 'Please enter Role'),
    );
  }

  Widget _buildInstituteName() {
    return CustomTextField(
      key: ValueKey('InstituteName-${_experience.instituteName}'),
      initialValue: _experience.instituteName,
      labelText: 'Institution / Organisation Name',
      onChanged: (val) => _experience.instituteName = val,
      validator: AlphabetsSpaceValidator(
          emptyMsg: 'Enter Institution / Organisation Name'),
    );
  }

  Widget _buildJobTitle() {
    return CustomTextField(
      key: ValueKey('Title-${_experience.title}'),
      initialValue: _experience.title,
      labelText: 'Job Title',
      onChanged: (val) => _experience.title = val,
      validator: AlphabetsSpaceValidator(emptyMsg: 'Enter Job Title'),
    );
  }

  Widget _buildStartDate() {
    return IOSDatePicker(
      key: ValueKey('StartDate-${_experience.startDate}'),
      initialValue: _experience.startDate,
      labelText: 'Start Date',
      context: context,
      onChanged: _experience.setStartDate,
      validator: _startDateValidator,
    );
  }

  String? _startDateValidator(DateTime? startDate) {
    if (startDate == null) return 'Select Start Date';

    final yesterday = DateTime.now().subtract(Duration(days: 1));
    if (startDate.isAfter(yesterday))
      return 'Start Date should be before today';
    return null;
  }

  Widget _buildWorkingTillDate() {
    return Row(
      children: [
        InkWell(
          child: Icon(
            _experience.isWorkingTillDate
                ? Icons.check_box_rounded
                : Icons.check_box_outline_blank_rounded,
            color: Theme.of(context).primaryColor,
          ),
          onTap: _experience.toggleWorkingTillDate,
        ),
        SizedBox(width: 8),
        Text(
          'Working Till Date',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ],
    );
  }

  Widget _buildEndDate() {
    return IOSDatePicker(
      key: ValueKey('EndDate-${_experience.endDate}'),
      initialValue: _experience.endDate,
      labelText: 'End Date',
      context: context,
      onChanged: _experience.setEndDate,
      validator: _endDateValidator,
    );
  }

  String? _endDateValidator(DateTime? endDate) {
    if (_experience.endDate == null)
      return 'Select End Date';
    else if (endDate!.isBefore(_experience.startDate!))
      return 'End date should be after Start date';
    return null;
  }

  Widget _buildSalary() {
    return CustomTextField(
      key: ValueKey('Salary-${_experience.salary}'),
      initialValue: _experience.salary,
      labelText: 'Salary Per Annum',
      keyboardType: TextInputType.number,
      onChanged: (val) => _experience.salary = val,
      validator: MinimumSalaryValidator(),
    );
  }

  Widget _buildEmploymentType() {
    return FormDropdown(
      context: context,
      key: ValueKey('Employment Type-${_experience.employmentTypeId}'),
      label: 'Employment Type',
      items: _formService.employmentTypes,
      initialVal: _experience.employmentType,
      onChanged: (val) => _experience.employmentType = val,
    );
  }

  Widget _buildNoticePeriod() {
    return FormDropdown(
      context: context,
      key: ValueKey('Notice Period-${_experience.currentCompany}'),
      label: 'Notice Period',
      items: _formService.noticePeriods,
      initialVal: _experience.noticePeriod,
      onChanged: (val) => _experience.noticePeriod = val,
    );
  }

  Widget _buildEmploymentStatus() {
    return CustomRadio(
      label: 'Employment Status',
      selectedItem: _experience.employmentStatus,
      item1: 'Probation',
      item2: 'Confirmed',
      onItemChanged: (val) => _experience.employmentStatus = val,
    );
  }

  Widget _buildCountry() {
    return IgnorePointer(
      child: FormDropdown(
        context: context,
        key: ValueKey('COUNTRY-${_experience.countryId}'),
        label: 'Country',
        items: _formService.countries,
        initialVal: _experience.country,
        onChanged: _experience.setCountry,
      ),
    );
  }

  Widget _buildCity() {
    return CustomFutureBuilder<List<FormEntity>>(
      future: _formService.getCities(),
      onData: (_, data) {
        return data.isNotEmpty
            ? FormDropdown(
                context: context,
                key: ValueKey('City-${_experience.countryId}'),
                label: 'City',
                items: data,
                initialVal: _experience.city,
                onChanged: (val) => _experience.city = val,
              )
            : SizedBox();
      },
      onLoading: _buildSizedBox,
      onError: (_, error) => DropdownErrorWidget(error: error),
    );
  }

  Widget _buildKeyResponsibility() {
    return CustomTextField(
      key: ValueKey('Key Responsibilities-${_experience.keyResponsibility}'),
      initialValue: _experience.keyResponsibility,
      labelText: 'Key Responsibilities',
      minLines: 1,
      maxLines: 10,
      onChanged: (val) => _experience.keyResponsibility = val,
      validator: EmptyValidator(errorMsg: 'Enter Key Responsibilities'),
    );
  }

  Widget _buildSaveButton() {
    return PrimaryButton(
      onPressed: _onPressedSave,
      text: 'Save',
    );
  }

  Future<void> _onPressedSave() async {
    if (!_formKey.currentState!.validate()) {
      SnackBarMessage.show(
          context, 'Please check and correct errors, then try again');
      return;
    }

    LoadingIndicator.show(context);
    bool isSaved = await _addOrUpdateWorkExperience();
    LoadingIndicator.close(context);
    if (isSaved) {
      SnackBarMessage.show(context, 'Saved Successfully', color: Colors.green);

      _returnToWorkExperiencesScreen();
    }
  }

  Future<bool> _addOrUpdateWorkExperience() async {
    try {
      if (_experience.shouldUpdate) {
        return await context
            .read<WorkExperiencesProvider>()
            .updateWorkExperience(_experience);
      } else {
        return await context
            .read<WorkExperiencesProvider>()
            .addWorkExperience(_experience);
      }
    } on Exception catch (e) {
      SnackBarMessage.show(context, e.toString());
      return false;
    }
  }

  void _returnToWorkExperiencesScreen() {
    Navigator.popUntil(
        context, ModalRoute.withName(RouteNames.workExperiences));
  }
}
