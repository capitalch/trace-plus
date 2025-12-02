import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';
import 'package:jobs_in_education/enums/upload_file.dart';
import 'package:jobs_in_education/features/profile/personal_info/services/personal_info_provider.dart';
import 'package:jobs_in_education/utils/loading_indicator.dart';
import 'package:provider/provider.dart';

import '/enums/gender.dart';
import '/enums/martial_status.dart';
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
import '/utils/assets_path.dart';
import '/utils/colors.dart';
import '/utils/screen_size.dart';
import '/utils/snack_bar_message.dart';
import '/utils/validator.dart';
import '../models/personal_info.dart';
import '../services/personal_info_form_service.dart';

class PersonalInfoForm extends StatefulWidget {
  final PersonalInfo info;
  const PersonalInfoForm({Key? key, required this.info}) : super(key: key);

  @override
  _PersonalInfoFormState createState() => _PersonalInfoFormState();
}

class _PersonalInfoFormState extends State<PersonalInfoForm> {
  final _screenSize = ScreenSize.instance;
  final _formKey = GlobalKey<FormState>();

  late PersonalInfo _info;
  late PersonalInfoFormService _formService;
  late ValueNotifier<String> _countryNotifier;
  late bool _hasFetchedInitialData;

  @override
  void initState() {
    super.initState();
    _hasFetchedInitialData = false;
    _countryNotifier = ValueNotifier('');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomAppBar(title: 'Personal Information'),
              const Text('Tell us about your personal information'),
              SizedBox(height: _screenSize.height(1.5)),
              Expanded(
                child: _hasFetchedInitialData
                    ? _buildForm()
                    : CustomFutureBuilder(
                        future: _loadInitialData(),
                        onData: (_, __) {
                          _hasFetchedInitialData = true;
                          return _buildForm();
                        }),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<bool> _loadInitialData() async {
    PersonalInfo info =
        await context.read<PersonalInfoProvider>().fetchPersonalInfo();
    _info = PersonalInfo.copy(info);
    _formService = PersonalInfoFormService(_info);
    _setCountryListener();

    if (_info.countryId.isNotEmpty) {
      _countryNotifier.value = _info.countryId;
    }

    return await _formService.loadInitialData();
  }

  void _setCountryListener() {
    _info.addListener(() {
      _countryNotifier.value = _info.countryId;
    });
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          children: [
            _buildProfileImage(),
            _buildFullNameTextField(),
            _buildMartialStatusRadio(),
            _buildGenderRadio(),
            _buildDOBDropdown(),
            _buildAddress(),
            _buildPinCode(),
            _buildCountryDropdown(),
            _buildCityDropdown(),
            _buildLanguagesKnownDropdown(),
            _buildAboutYouTextField(),
            _buildYoutubeSkills(),
            _buildSocialMediaLinks(),
            _buildUploadResume(),
            _buildUploadIdentityProof(),
            _buildUploadVideoResume(),
            SizedBox(height: 16),
            _buildSaveButton(),
            SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileImage() {
    return Padding(
      padding: const EdgeInsets.only(top: 12, bottom: 20),
      child: SizedBox(
        height: 62,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (_image != null)
              CircleAvatar(
                backgroundColor: Colors.transparent,
                child: ClipOval(
                  child: _image,
                ),
              ),
            if (_image == null)
              CircleAvatar(
                backgroundColor: Colors.grey.shade200,
                child: Text(
                  _info.shortName,
                  style: TextStyle(
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ),
            Positioned(
                bottom: 0,
                right: _screenSize.width(34),
                child: Container(
                  height: 24,
                  width: 24,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Theme.of(context).primaryColor,
                  ),
                  child: IconButton(
                    onPressed: _onPressedCameraIcon,
                    padding: EdgeInsets.zero,
                    icon: Icon(
                      Icons.camera_alt_outlined,
                      color: Colors.white,
                      size: 13,
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }

  FadeInImage? get _image {
    if (_info.profilePicUrl.isEmpty) return null;

    return FadeInImage.assetNetwork(
      image: _info.profilePicUrl,
      fit: BoxFit.cover,
      placeholder: AssetsPath.loadingGif,
    );
  }

  void _onPressedCameraIcon() async {
    final source = await _showSourceOptionsSheet();
    if (source == null) return;

    print('Picked Source: $source');
    final ImagePicker _picker = ImagePicker();
    final XFile? image = await _picker.pickImage(source: source);

    // if (image != null) {
    //   final file = await ImageCropper.cropImage(
    //     sourcePath: image.path,
    //     aspectRatio: CropAspectRatio(ratioX: 1.0, ratioY: 1.0),
    //   );
    //
    //   if (file != null) {
    //     if (await file.length() >= 2097152) {
    //       SnackBarMessage.show(context, 'Image should be up to 2MB');
    //       return;
    //     }
    //
    //     LoadingIndicator.show(context);
    //     try {
    //       String contentType = 'image/${_getFileExtension(file)}';
    //       final uploadedDetails = await _formService.uploadFile(
    //           file, UploadFileType.ProfilePic, contentType);
    //       _info.profilePicUrl = uploadedDetails.fileUrl;
    //       _info.profilePicFileKey = uploadedDetails.fileKey;
    //       LoadingIndicator.close(context);
    //       setState(() {});
    //     } on Exception catch (e) {
    //       LoadingIndicator.close(context);
    //       SnackBarMessage.show(context, 'Error uploading file!\n$e');
    //     }
    //   }
    // }
  }

  Future<ImageSource?> _showSourceOptionsSheet() async {
    return showModalBottomSheet<ImageSource>(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
            topLeft: Radius.circular(16), topRight: Radius.circular(16)),
      ),
      context: context,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _ImageSourceIcon(
                  source: ImageSource.gallery,
                  assetPath: AssetsPath.galleryIcon,
                  label: 'Gallery',
                ),
                _ImageSourceIcon(
                  source: ImageSource.camera,
                  assetPath: AssetsPath.cameraIcon,
                  label: 'Camera',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFullNameTextField() {
    return CustomTextField(
      enabled: false,
      key: ValueKey('Full Name - ${_info.fullName}'),
      labelText: 'Full Name',
      initialValue: _info.fullName,
      onChanged: (val) => _info.fullName = val,
      validator: EmptyValidator(errorMsg: 'Enter Full Name'),
    );
  }

  Widget _buildMartialStatusRadio() {
    return CustomRadio(
      key: ValueKey(_info.martialStatus),
      selectedItem: _info.martialStatus.string,
      item1: MartialStatus.Single.string,
      item2: MartialStatus.Married.string,
      onItemChanged: (val) => _info.martialStatus = val.martialStatus,
      label: 'Martial Status',
    );
  }

  Widget _buildGenderRadio() {
    return CustomRadio(
      key: ValueKey(_info.gender),
      selectedItem: _info.gender.string,
      item1: Gender.Male.string,
      item2: Gender.Female.string,
      onItemChanged: (val) => _info.gender = val.gender,
      label: 'Gender',
    );
  }

  Widget _buildDOBDropdown() {
    return IOSDatePicker(
      key: ValueKey('DOB-${_info.dateOfBirth}'),
      labelText: 'Date Of Birth',
      initialValue: _info.dateOfBirth,
      context: context,
      onChanged: (date) => _info.dateOfBirth = date,
      validator: (val) {
        if (val == null) return 'Enter Date Of Birth';
        final years18 = DateTime.now().subtract(Duration(days: (365 * 18) + 5));
        if (val.isAfter(years18)) return 'Minimum age should be 18 years';
        return null;
      },
    );
  }

  Widget _buildAddress() {
    return CustomTextField(
      key: ValueKey('Address - ${_info.address}'),
      labelText: 'Address',
      maxLines: 1,
      validator: EmptyValidator(errorMsg: 'Enter your address'),
      initialValue: _info.address,
      onChanged: (val) => _info.address = val,
    );
  }

  Widget _buildPinCode() {
    return CustomTextField(
      key: ValueKey('PIN Code - ${_info.pinCode}'),
      labelText: 'PIN Code',
      maxLines: 1,
      validator: PinCodeValidator(),
      initialValue: _info.pinCode,
      onChanged: (val) => _info.pinCode = val,
      keyboardType: TextInputType.number,
    );
  }

  Widget _buildCountryDropdown() {
    return IgnorePointer(
      child: FormDropdown(
        context: context,
        label: 'Country',
        items: _formService.countries,
        initialVal: _info.country,
        onChanged: _info.updateCountry,
      ),
    );
  }

  Widget _buildCityDropdown() {
    return ValueListenableBuilder<String>(
      valueListenable: _countryNotifier,
      builder: (_, countryId, __) {
        return countryId.isEmpty
            ? SizedBox()
            : CustomFutureBuilder<List<FormEntity>>(
                future: _formService.getCities(),
                onData: (_, data) {
                  return data.isNotEmpty
                      ? FormDropdown(
                          context: context,
                          key: ValueKey('City-${_info.countryId}'),
                          label: 'City',
                          items: data,
                          initialVal: _info.city,
                          onChanged: (val) => _info.city = val,
                        )
                      : const SizedBox();
                },
                onLoading: () => const SizedBox(),
                onError: (_, error) => DropdownErrorWidget(error: error),
              );
      },
    );
  }

  Widget _buildLanguagesKnownDropdown() {
    return LanguagesKnownWidget(
      languages: _formService.languages,
      selectedLanguages: _info.languages,
      onChanged: (values) => _info.languages = values,
    );
  }

  Widget _buildAboutYouTextField() {
    return CustomTextField(
      key: ValueKey('About you - ${_info.aboutYou}'),
      labelText: 'Description About You',
      maxLines: 5,
      minLines: 1,
      validator: EmptyValidator(errorMsg: 'Enter Description About You'),
      initialValue: _info.aboutYou,
      onChanged: (val) => _info.aboutYou = val,
    );
  }

  Widget _buildYoutubeSkills() {
    return YoutubeSkillsWidget(skills: _info.youtubeSkills);
  }

  Widget _buildSocialMediaLinks() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Social media Link',
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  color: Colors.black,
                )),
        SizedBox(height: 10),
        CustomTextField(
          hintText: 'Linkedin Link',
          prefixIcon: _buildPrefixIcon(AssetsPath.prefixLinkedinIcon),
          initialValue: _info.linkedinLink,
          onChanged: (val) => _info.linkedinLink = val,
          contentPadding: EdgeInsets.zero,
          validator: SocialLinkValidator(),
        ),
        CustomTextField(
          hintText: 'Facebook Link',
          prefixIcon: _buildPrefixIcon(AssetsPath.prefixFacebookIcon),
          initialValue: _info.facebookLink,
          onChanged: (val) => _info.facebookLink = val,
          contentPadding: EdgeInsets.zero,
          validator: SocialLinkValidator(),
        ),
        CustomTextField(
          hintText: 'Twitter Link',
          prefixIcon: _buildPrefixIcon(AssetsPath.prefixTwitterIcon),
          initialValue: _info.twitterLink,
          onChanged: (val) => _info.twitterLink = val,
          contentPadding: EdgeInsets.zero,
          validator: SocialLinkValidator(),
        ),
        CustomTextField(
          hintText: 'Instagram Link',
          prefixIcon: _buildPrefixIcon(AssetsPath.prefixInstagramIcon),
          initialValue: _info.instagramLink,
          onChanged: (val) => _info.instagramLink = val,
          contentPadding: EdgeInsets.zero,
          validator: SocialLinkValidator(),
        ),
      ],
    );
  }

  Padding _buildPrefixIcon(String iconPath) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(10),
          bottomLeft: Radius.circular(10),
        ),
        child: Image.asset(
          iconPath,
          height: 32,
        ),
      ),
    );
  }

  Widget _buildUploadResume() {
    return UploadFileWidget(
      label: _info.resumeLabel,
      fileConstraintMsg: '(Doc, Docx, rtf, pdf - 2mb max)',
      fileType: FileType.custom,
      allowExtensions: ['pdf', 'doc', 'docx', 'rtf'],
      onFilePicked: (file) async {
        if (file != null) {
          LoadingIndicator.show(context);
          try {
            String contentType = 'application/${_getFileExtension(file)}';
            final uploadedDetails = await _formService.uploadFile(
                file, UploadFileType.Resume, contentType);
            _info.resumeUrl = uploadedDetails.fileUrl;
            _info.resumeFileKey = uploadedDetails.fileKey;
            LoadingIndicator.close(context);
          } on Exception catch (e) {
            LoadingIndicator.close(context);
            SnackBarMessage.show(context, 'Error uploading file!\n$e');
          }
        }
      },
    );
  }

  Widget _buildUploadIdentityProof() {
    return UploadFileWidget(
      label: _info.idProofLabel,
      fileConstraintMsg: '(Doc, Docx, rtf, pdf - 2mb max)',
      fileType: FileType.custom,
      allowExtensions: ['pdf', 'doc', 'docx', 'rtf'],
      onFilePicked: (file) async {
        if (file != null) {
          LoadingIndicator.show(context);
          try {
            String contentType = 'application/${_getFileExtension(file)}';
            final uploadedDetails = await _formService.uploadFile(
                file, UploadFileType.IdentityProof, contentType);
            _info.identityProofUrl = uploadedDetails.fileUrl;
            _info.idProofFileKey = uploadedDetails.fileKey;
            LoadingIndicator.close(context);
          } on Exception catch (e) {
            LoadingIndicator.close(context);
            SnackBarMessage.show(context, 'Error uploading file!\n$e');
          }
        }
      },
    );
  }

  Widget _buildUploadVideoResume() {
    return UploadFileWidget(
      label: _info.videoResumeLabel,
      fileConstraintMsg: '(mp4, 3gp - 5mb max)',
      fileType: FileType.custom,
      allowExtensions: ['mp4', '3gp'],
      maxSizeInMB: 5,
      onFilePicked: (file) async {
        if (file != null) {
          LoadingIndicator.show(context);
          try {
            String contentType = 'video/${_getFileExtension(file)}';
            final uploadedDetails = await _formService.uploadFile(
                file, UploadFileType.VideoResume, contentType);
            _info.videoResumeUrl = uploadedDetails.fileUrl;
            _info.videoResumeFileKey = uploadedDetails.fileKey;
            LoadingIndicator.close(context);
          } on Exception catch (e) {
            LoadingIndicator.close(context);
            SnackBarMessage.show(context, 'Error uploading file!\n$e');
          }
        }
      },
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
    print(_info.toJson());

    // check for proficiency
    if (!_info.languages
        .every((element) => (element as Language).isProficiencySelected())) {
      SnackBarMessage.show(
          context, 'Please select at least one proficiency for each language');
      return;
    }

    // check if resume uploaded
    if (_info.resumeUrl.isEmpty) {
      SnackBarMessage.show(context, 'Please upload resume.');
      return;
    }

    LoadingIndicator.show(context);
    bool isSaved = await _updatePersonalInfo();
    LoadingIndicator.close(context);
    if (isSaved) {
      SnackBarMessage.show(context, 'Saved Successfully', color: Colors.green);
      Navigator.pop(context);
    }
  }

  Future<bool> _updatePersonalInfo() async {
    try {
      return await context
          .read<PersonalInfoProvider>()
          .updatePersonalInfo(_info);
    } on Exception catch (e) {
      print('Error: ${e.toString()}');
      SnackBarMessage.show(context, e.toString());
      return false;
    }
  }

  String _getFileExtension(File file) {
    return file.path.split('.').last.toLowerCase();
  }
}

class UploadFileWidget extends StatefulWidget {
  final String label;
  final String fileConstraintMsg;
  final void Function(File?) onFilePicked;
  final List<String>? allowExtensions;
  final FileType fileType;
  final int maxSizeInMB;

  UploadFileWidget({
    Key? key,
    required this.label,
    required this.onFilePicked,
    this.fileConstraintMsg = '',
    this.allowExtensions,
    this.fileType = FileType.any,
    this.maxSizeInMB = 2,
  }) : super(key: key) {
    if (fileType == FileType.custom) {
      assert(allowExtensions != null,
          'allowed extension should not be null when fileType is Custom');
    }
  }

  @override
  State<UploadFileWidget> createState() => _UploadFileWidgetState();
}

class _UploadFileWidgetState extends State<UploadFileWidget> {
  late String text;
  late String errorMsg;

  @override
  void initState() {
    super.initState();
    text = widget.label;
    errorMsg = '';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            onTap: _pickFile,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: extraLightBlue,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: lightBlue,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    AssetsPath.cloudUploadIcon,
                    height: 32,
                  ),
                  SizedBox(width: 10),
                  Flexible(
                    child: Text(
                      text,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (errorMsg.isNotEmpty) const SizedBox(height: 2),
          if (errorMsg.isNotEmpty)
            Row(
              children: [
                const SizedBox(width: 12),
                Text(
                  errorMsg,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium!
                      .copyWith(fontSize: 10, color: Colors.red),
                ),
              ],
            ),
          if (_hasConstraintMsg) const SizedBox(height: 4),
          if (_hasConstraintMsg)
            Text(
              widget.fileConstraintMsg,
              style:
                  Theme.of(context).textTheme.bodyMedium!.copyWith(fontSize: 10),
            ),
        ],
      ),
    );
  }

  bool get _hasConstraintMsg => widget.fileConstraintMsg.isNotEmpty;

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: widget.fileType,
      allowedExtensions: widget.allowExtensions,
    );

    if (result != null) {
      PlatformFile platformFile = result.files.first;

      if (!_isFileTypeAllowed(platformFile) || !_isFileSizeOk(platformFile)) {
        return;
      }

      // widget.onFilePicked(File(platformFile.path));
      setState(() {
        text = platformFile.name;
        errorMsg = '';
      });
    }
  }

  bool _isFileTypeAllowed(PlatformFile platformFile) {
    if (widget.allowExtensions != null &&
        widget.allowExtensions!.contains(platformFile.extension)) {
      return true;
    }

    setState(() {
      errorMsg = '${platformFile.extension} format not allowed';
      text = widget.label;
    });
    return false;
  }

  bool _isFileSizeOk(PlatformFile platformFile) {
    int sizeInMB = (platformFile.size / 1024) ~/ 1024;
    if (sizeInMB > widget.maxSizeInMB) {
      setState(() {
        errorMsg = 'Maximum allowable size is ${widget.maxSizeInMB} MB';
        text = widget.label;
      });
      return false;
    }

    return true;
  }
}

class _ImageSourceIcon extends StatelessWidget {
  const _ImageSourceIcon({
    Key? key,
    required this.source,
    required this.assetPath,
    required this.label,
  }) : super(key: key);

  final ImageSource source;
  final String assetPath;
  final String label;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Navigator.pop(context, source),
      child: Column(
        children: [
          Image.asset(
            assetPath,
            width: 36,
          ),
          SizedBox(height: 4),
          Text(label),
        ],
      ),
    );
  }
}

class LanguagesKnownWidget extends StatefulWidget {
  final List<FormEntity> languages;
  final List<FormEntity> selectedLanguages;
  final void Function(List<FormEntity>) onChanged;

  const LanguagesKnownWidget({
    Key? key,
    required this.languages,
    required this.selectedLanguages,
    required this.onChanged,
  }) : super(key: key);

  @override
  _LanguagesKnownWidgetState createState() => _LanguagesKnownWidgetState();
}

class _LanguagesKnownWidgetState extends State<LanguagesKnownWidget> {
  late List<FormEntity> _selectedValues;

  String get _ids => _selectedValues.map((e) => e.name).join('-');

  @override
  void initState() {
    super.initState();
    _selectedValues = widget.selectedLanguages;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        MultiSelectDropdown(
          key: ValueKey(_ids),
          items: widget.languages,
          label: 'Language Known',
          initialVal: _selectedValues.isEmpty ? null : _selectedValues,
          context: context,
          onChanged: (values) {
            if (values != null) {
              widget.onChanged(values);
              setState(() {
                _selectedValues = values;
              });
            }
          },
        ),
        if (_selectedValues.isNotEmpty)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: _selectedValues.map((e) {
              return ProficiencyWidget(
                key: ValueKey(e.name),
                proficiency: (e as Language).proficiency,
                languageName: e.name,
              );
            }).toList(),
          ),
      ],
    );
  }
}

class ProficiencyWidget extends StatefulWidget {
  final String languageName;
  final LanguageProficiency proficiency;

  const ProficiencyWidget({
    Key? key,
    required this.languageName,
    required this.proficiency,
  }) : super(key: key);

  @override
  _ProficiencyWidgetState createState() => _ProficiencyWidgetState();
}

class _ProficiencyWidgetState extends State<ProficiencyWidget> {
  @override
  void initState() {
    super.initState();

    widget.proficiency.addListener(_rebuild);
  }

  void _rebuild() => setState(() {});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Proficiency in ${widget.languageName}'),
          Row(
            children: [
              OutlinedButton(
                onPressed: widget.proficiency.toggleReading,
                child: _proficiencyText(widget.proficiency.reading, 'Reading'),
                style: _style(widget.proficiency.reading),
              ),
              SizedBox(width: 10),
              OutlinedButton(
                onPressed: widget.proficiency.toggleWriting,
                child: _proficiencyText(widget.proficiency.writing, 'Writing'),
                style: _style(widget.proficiency.writing),
              ),
              SizedBox(width: 10),
              OutlinedButton(
                onPressed: widget.proficiency.toggleSpeaking,
                child:
                    _proficiencyText(widget.proficiency.speaking, 'Speaking'),
                style: _style(widget.proficiency.speaking),
              ),
            ],
          ),
        ],
      ),
    );
  }

  ButtonStyle _style(bool isProficient) {
    return OutlinedButton.styleFrom(
      backgroundColor:
          isProficient ? Theme.of(context).primaryColor : extraLightBlue,
    );
  }

  Text _proficiencyText(bool isProficient, String label) {
    return Text(
      label,
      style: TextStyle(
        color: isProficient ? Colors.white : Theme.of(context).primaryColor,
      ),
    );
  }
}

class YoutubeSkillsWidget extends StatefulWidget {
  final List<YoutubeSkill> skills;

  const YoutubeSkillsWidget({Key? key, required this.skills}) : super(key: key);

  @override
  _YoutubeSkillsWidgetState createState() => _YoutubeSkillsWidgetState();
}

class _YoutubeSkillsWidgetState extends State<YoutubeSkillsWidget> {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Youtube Skills',
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        color: Colors.black,
                      ),
                ),
                TextButton.icon(
                  onPressed: _onPressedAdd,
                  label: Text("Add"),
                  icon: Icon(
                    Icons.add,
                    size: 22,
                  ),
                  style: TextButton.styleFrom(
                      padding: EdgeInsets.all(0),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                ),
              ],
            ),
            if (widget.skills.isNotEmpty) Divider(),
            ...widget.skills
                .map((e) => Column(
                      key: ValueKey(e.link.isNotEmpty
                          ? e.link
                          : '${widget.skills.indexOf(e)}'),
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: CustomTextField(
                                prefixIcon: Padding(
                                  padding: const EdgeInsets.only(right: 12),
                                  child: Image.asset(
                                      AssetsPath.prefixYoutubeIcon,
                                      height: 32),
                                ),
                                contentPadding: EdgeInsets.zero,
                                initialValue: e.link,
                                hintText:
                                    'Link ${widget.skills.indexOf(e) + 1}',
                                onChanged: (val) => e.link = val,
                                validator: UrlValidator(),
                              ),
                            ),
                            IconButton(
                                padding: EdgeInsets.only(top: 4),
                                alignment: Alignment.center,
                                onPressed: () {
                                  widget.skills.remove(e);
                                  setState(() {});
                                },
                                icon: Icon(
                                  Icons.delete,
                                  color: Colors.grey,
                                )),
                          ],
                        ),
                        CustomTextField(
                          initialValue: e.description,
                          labelText: 'Description',
                          onChanged: (val) => e.description = val,
                          validator:
                              EmptyValidator(errorMsg: 'Enter description'),
                        ),
                      ],
                    ))
                .toList(),
          ],
        ),
      ),
    );
  }

  void _onPressedAdd() {
    widget.skills.add(YoutubeSkill());
    setState(() {});
  }
}
