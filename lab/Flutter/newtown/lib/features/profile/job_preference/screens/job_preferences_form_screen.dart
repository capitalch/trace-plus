import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '/features/other/models/form_entity.dart';
import '/features/other/widgets/custom_app_bar.dart';
import '/features/other/widgets/custom_future_builder.dart';
import '/features/other/widgets/custom_text_field.dart';
import '/features/other/widgets/dropdown.dart';
import '/features/other/widgets/dropdown_error_widget.dart';
import '/features/other/widgets/multi_select_dropdown.dart';
import '/features/other/widgets/primary_button.dart';
import '/utils/colors.dart';
import '/utils/loading_indicator.dart';
import '/utils/screen_size.dart';
import '/utils/snack_bar_message.dart';
import '/utils/validator.dart';
import '../models/job_preference.dart';
import '../services/job_preference_form_service.dart';
import '../services/job_preferences_provider.dart';

class JobPreferencesFormScreen extends StatefulWidget {
  final JobPreference jobPreference;
  JobPreferencesFormScreen({Key? key, required this.jobPreference})
      : super(key: key);

  @override
  _JobPreferencesFormScreenState createState() =>
      _JobPreferencesFormScreenState();
}

class _JobPreferencesFormScreenState extends State<JobPreferencesFormScreen> {
  late final JobPreference _jobPreference;
  late final JobPreferenceFormService _formService;
  final _formKey = GlobalKey<FormState>();

  final _screenSize = ScreenSize.instance;

  bool _hasFetchedInitialFormData = false;
  late bool _isCustomJobNameSelected;

  static const _sizedBox = SizedBox();

  SizedBox _buildSizedBox() => _sizedBox;

  late final ValueNotifier<String> _jobTitleListener;

  @override
  void initState() {
    super.initState();
    _jobPreference = JobPreference.copy(widget.jobPreference);
    _formService = JobPreferenceFormService(_jobPreference);
    _isCustomJobNameSelected = _jobPreference.customJobTitle.isNotEmpty;
    _jobTitleListener = ValueNotifier(_jobPreference.jobTitle);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomAppBar(title: 'Job Preference'),
              Text('What type of job are you looking for ?'),
              SizedBox(height: _screenSize.height(1.5)),
              Expanded(
                child: !_hasFetchedInitialFormData
                    ? CustomFutureBuilder<bool>(
                        future: _formService.loadInitialData(),
                        onData: (_, data) {
                          _hasFetchedInitialFormData = true;
                          return _buildJobPreferenceForm();
                        },
                      )
                    : _buildJobPreferenceForm(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _onPressedSave() async {
    print(_jobPreference.toJson());

    if (!_formKey.currentState!.validate()) {
      SnackBarMessage.show(
          context, 'Please check and correct errors, then try again');
      return;
    }

    LoadingIndicator.show(context);
    bool isSaved = await _addOrUpdateJobPreference();
    LoadingIndicator.close(context);
    if (isSaved) {
      SnackBarMessage.show(context, 'Saved Successfully', color: Colors.green);
      Navigator.pop(context);
    }
  }

  Future<bool> _addOrUpdateJobPreference() async {
    try {
      if (_jobPreference.shouldUpdate) {
        return await context
            .read<JobPreferenceProvider>()
            .updateJobPreference(_jobPreference);
      } else {
        return await context
            .read<JobPreferenceProvider>()
            .addJobPreference(_jobPreference);
      }
    } on Exception catch (e) {
      print('Error: ${e.toString()}');
      SnackBarMessage.show(context, e.toString());
      return false;
    }
  }

  Widget _buildJobPreferenceForm() {
    return Form(
      key: _formKey,
      child: ListView(
        children: [
          FormDropdown(
            key: ValueKey('JC'),
            context: context,
            label: 'Job Category',
            items: _formService.jobCategories,
            initialVal: _jobPreference.jobCategory,
            onChanged: (val) async {
              _jobPreference.resetDependenciesOnJobCategory();
              await _fetchJobTitle();
              setState(() {
                _jobPreference.jobCategory = val as JobCategory;
              });
            },
          ),
          if (_formService.shouldBuildInstitutionType)
            CustomFutureBuilder<List<InstitutionType>>(
              future: _formService.getInstitutionTypes(),
              onData: (_, data) {
                return data.isNotEmpty
                    ? FormDropdown(
                        key: ValueKey('IT-${_jobPreference.jobCategoryId}'),
                        context: context,
                        label: 'Institute Type',
                        items: data,
                        initialVal: _jobPreference.institutionType,
                        onChanged: (val) async {
                          if (val.id != _jobPreference.institutionTypeId) {
                            _jobPreference.resetDependenciesOnInstitutionType();
                            _jobPreference.institutionType =
                                val as InstitutionType;
                            await _fetchJobTitle();
                            setState(() {});
                          }
                        },
                      )
                    : _sizedBox;
              },
              onLoading: _buildSizedBox,
              onError: (_, error) => DropdownErrorWidget(error: error),
            ),
          if (_formService.shouldBuildInstitutionSubType)
            CustomFutureBuilder<List<InstitutionSubType>>(
              future: _formService.getInstitutionSubTypes(),
              onData: (_, data) {
                return data.isNotEmpty
                    ? FormDropdown(
                        context: context,
                        key:
                            ValueKey('IST-${_jobPreference.institutionTypeId}'),
                        label: _jobPreference
                            .institutionType!.institutionSubTypeLabel,
                        items: data,
                        initialVal: _jobPreference.institutionSubType,
                        onChanged: (val) async {
                          _jobPreference
                              .resetDependenciesOnInstitutionSubType();
                          _jobPreference.institutionSubType =
                              val as InstitutionSubType;
                          await _fetchJobTitle();
                          setState(() {});
                        },
                      )
                    : _sizedBox;
              },
              onLoading: _buildSizedBox,
              onError: (_, error) => DropdownErrorWidget(error: error),
            ),
          if (_formService.shouldBuildInstitutionMinorType)
            CustomFutureBuilder<List<InstitutionMinorType>>(
              future: _formService.getInstitutionMinorTypes(),
              onData: (_, data) {
                return data.isNotEmpty
                    ? FormDropdown(
                        context: context,
                        key: ValueKey(
                            'IMT-${_jobPreference.institutionSubTypeId}'),
                        label: _jobPreference
                            .institutionSubType!.institutionMinorTypeLabel,
                        items: data,
                        initialVal: _jobPreference.institutionMinorType,
                        onChanged: (val) async {
                          _jobPreference.institutionMinorType =
                              val as InstitutionMinorType;
                          await _fetchJobTitle();
                        },
                      )
                    : _sizedBox;
              },
              onLoading: _buildSizedBox,
              onError: (_, error) => DropdownErrorWidget(error: error),
            ),
          if (_formService.shouldBuildSubject)
            CustomFutureBuilder<List<Subject>>(
              future: _formService.getSubjects(),
              onData: (_, data) {
                return data.isNotEmpty
                    ? FormDropdown(
                        context: context,
                        key: ValueKey(
                            'Subject-${_jobPreference.institutionSubTypeId}'),
                        label: 'Subject',
                        items: data,
                        initialVal: _jobPreference.subject,
                        onChanged: (val) async {
                          _jobPreference.subject = val as Subject;
                          await _fetchJobTitle();
                        },
                      )
                    : _sizedBox;
              },
              onLoading: _buildSizedBox,
              onError: (_, error) => DropdownErrorWidget(error: error),
            ),
          if (_formService.shouldBuildRole)
            CustomFutureBuilder<List<Role>>(
              future: _formService.getRoles(),
              onData: (context, data) {
                return data.isNotEmpty
                    ? FormDropdown(
                        context: context,
                        key: ValueKey(
                            'Role-${_jobPreference.institutionTypeId}'),
                        label: 'Role',
                        items: data,
                        initialVal: _jobPreference.role,
                        onChanged: (val) async {
                          _jobPreference.role = val as Role?;
                          await _fetchJobTitle();
                        },
                      )
                    : SizedBox();
              },
              onLoading: _buildSizedBox,
              onError: (_, error) => DropdownErrorWidget(error: error),
            ),
          FormDropdown(
            context: context,
            key: ValueKey('EXP-${_jobPreference.experienceId}'),
            label: 'Relevant Experience',
            items: _formService.experiences,
            initialVal: _jobPreference.experience,
            onChanged: (val) async {
              _jobPreference.experience = val as Experience;
              await _fetchJobTitle();
            },
          ),
          CustomTextField(
            initialValue: _jobPreference.minimumSalary,
            labelText: 'Minimum Acceptable Salary Per Annum',
            keyboardType: TextInputType.number,
            onChanged: (val) {
              _jobPreference.minimumSalary = val;
            },
            validator: MinimumSalaryValidator(),
          ),
          FormDropdown(
            context: context,
            key: ValueKey('ETP-${_jobPreference.employmentTypeId}'),
            label: 'Employment Type',
            items: _formService.employmentTypes,
            initialVal: _jobPreference.employmentType,
            onChanged: (val) async {
              _jobPreference.employmentType = val as EmploymentType;
              await _fetchJobTitle();
            },
          ),
          IgnorePointer(
            child: FormDropdown(
              context: context,
              key: ValueKey('COUNTRY-${_jobPreference.countryId}'),
              label: 'Preferred Country',
              items: _formService.countries,
              initialVal: _jobPreference.country,
              onChanged: (val) async {
                _jobPreference.resetDependenciesOnCountry();
                _jobPreference.country = val as Country;
                await _fetchJobTitle();
                setState(() {});
              },
            ),
          ),
          if (_jobPreference.country != null)
            // _buildCityDropdown(),
            CustomFutureBuilder<List<City>>(
              future: _formService.getCities(),
              onData: (_, data) {
                return data.isNotEmpty
                    ? MultiSelectDropdown(
                        key: ValueKey(_jobPreference.citiesName.isNotEmpty
                            ? _jobPreference.citiesName
                            : 'City'),
                        initialVal: _jobPreference.cities,
                        items: data,
                        maxSelectable: 3,
                        label: 'Preferred City',
                        context: context,
                        onChanged: (values) async {
                          _jobPreference.cities = values != null
                              ? values
                                  .map((e) => City(id: e.id, name: e.name))
                                  .toList()
                              : [];
                          await _fetchJobTitle();
                        })
                    : _sizedBox;
              },
              onLoading: _buildSizedBox,
              onError: (_, error) => DropdownErrorWidget(error: error),
            ),
          ValueListenableBuilder<String>(
            valueListenable: _jobTitleListener,
            builder: (_, title, __) {
              return CustomTextField(
                key: ValueKey(title),
                maxLines: 3,
                minLines: 1,
                enabled: false,
                fillColor: lightBlue,
                initialValue: title,
                labelText: 'Job Title',
              );
            },
          ),
          Row(
            children: [
              InkWell(
                child: Icon(
                  _isCustomJobNameSelected
                      ? Icons.check_box_rounded
                      : Icons.check_box_outline_blank_rounded,
                  color: Theme.of(context).primaryColor,
                ),
                onTap: () {
                  setState(() {
                    _jobPreference.customJobTitle = '';
                    _isCustomJobNameSelected = !_isCustomJobNameSelected;
                  });
                },
              ),
              SizedBox(width: 8),
              Text(
                'Custom Job Title',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          ),
          SizedBox(height: _isCustomJobNameSelected ? 8 : 12),
          if (_isCustomJobNameSelected)
            CustomTextField(
              key: ValueKey('CustomJobTitle-${_jobPreference.customJobTitle}'),
              initialValue: _jobPreference.customJobTitle,
              labelText: 'Custom Job Title',
              onChanged: (val) {
                _jobPreference.customJobTitle = val;
              },
              validator: AlphabetsSpaceValidator(
                  emptyMsg: 'Please enter Custom Job Title'),
            ),
          PrimaryButton(
            onPressed: _onPressedSave,
            text: 'Save',
          ),
          SizedBox(height: 16),
        ],
      ),
    );
  }

  Future<void> _fetchJobTitle() async {
    if (FocusScope.of(context).hasFocus) {
      FocusScope.of(context).unfocus();
    }
    String jobTitle = await _formService.getJobTitle();
    _jobPreference.jobTitle = jobTitle;
    _jobTitleListener.value = jobTitle;

    //setState(() {});
  }
}
