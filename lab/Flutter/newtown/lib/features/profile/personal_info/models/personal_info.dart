import 'package:flutter/cupertino.dart';

import '/enums/gender.dart';
import '/enums/martial_status.dart';
import '/features/other/models/form_entity.dart';
import '/utils/date_time_extension.dart';

class PersonalInfo with ChangeNotifier {
  String fullName;
  MartialStatus martialStatus;
  Gender gender;
  DateTime? dateOfBirth;
  FormEntity? country;
  FormEntity? city;
  String pinCode;
  String address;
  String aboutYou;
  List<FormEntity> languages;
  String profilePicUrl;
  String profilePicFileKey;
  String resumeUrl;
  String resumeFileKey;
  String identityProofUrl;
  String idProofFileKey;
  String videoResumeUrl;
  String videoResumeFileKey;
  String linkedinLink;
  String facebookLink;
  String twitterLink;
  String instagramLink;
  List<YoutubeSkill> youtubeSkills;

  String get countryId => country?.id ?? '';
  String get cityId => city?.id ?? '';

  String get shortName {
    if (fullName.isEmpty) return fullName;

    final names = fullName.split(' ');
    String sName = names.first.characters.first;
    if (names.length > 1) {
      sName = '$sName${names.last.characters.first}';
    }
    return sName;
  }

  String get resumeLabel =>
      resumeUrl.isEmpty ? 'Upload Resume' : 'Resume Uploaded';
  String get idProofLabel => identityProofUrl.isEmpty
      ? 'Upload Identity Proof'
      : 'Identity Proof Uploaded';
  String get videoResumeLabel =>
      videoResumeUrl.isEmpty ? 'Upload Video Resume' : 'Video Resume Uploaded';

  PersonalInfo({
    this.fullName = '',
    this.martialStatus = MartialStatus.Single,
    this.gender = Gender.Male,
    this.dateOfBirth,
    this.country,
    this.city,
    this.pinCode = '',
    this.address = '',
    this.aboutYou = '',
    this.languages = const [],
    this.profilePicFileKey = '',
    this.profilePicUrl = '',
    this.resumeFileKey = '',
    this.resumeUrl = '',
    this.idProofFileKey = '',
    this.identityProofUrl = '',
    this.videoResumeFileKey = '',
    this.videoResumeUrl = '',
    this.linkedinLink = '',
    this.facebookLink = '',
    this.twitterLink = '',
    this.instagramLink = '',
    this.youtubeSkills = const [],
  });

  factory PersonalInfo.copy(PersonalInfo info) {
    return PersonalInfo(
      fullName: info.fullName,
      martialStatus: info.martialStatus,
      gender: info.gender,
      dateOfBirth: info.dateOfBirth,
      country: info.country,
      city: info.city,
      pinCode: info.pinCode,
      address: info.address,
      aboutYou: info.aboutYou,
      languages: List.of(info.languages),
      profilePicFileKey: info.profilePicFileKey,
      profilePicUrl: info.profilePicUrl,
      resumeFileKey: info.resumeFileKey,
      resumeUrl: info.resumeUrl,
      idProofFileKey: info.idProofFileKey,
      identityProofUrl: info.identityProofUrl,
      videoResumeFileKey: info.videoResumeFileKey,
      videoResumeUrl: info.videoResumeUrl,
      linkedinLink: info.linkedinLink,
      facebookLink: info.facebookLink,
      twitterLink: info.twitterLink,
      instagramLink: info.instagramLink,
      youtubeSkills: List.of(info.youtubeSkills),
    );
  }

  static const fullNameKey = "fullName";
  static const martialStatusKey = "maritalStatus";
  static const genderKey = "gender";
  static const dobKey = "dob";
  static const countryKey = "country";
  static const countryObjKey = "countryObj";
  static const cityKey = "city";
  static const cityObjKey = "cityObj";
  static const pinCodeKey = "pincode";
  static const addressKey = "address";
  static const aboutYouKey = "profDescription";
  static const linkedinKey = "linkedinLink";
  static const twitterKey = "twitterLink";
  static const facebookKey = "facebookLink";
  static const instagramKey = "instagramLink";
  static const profilePicKey = "photo";
  static const profilePicObjKey = "photoObj";
  static const resumeKey = "resume";
  static const resumeObjKey = "resumeObj";
  static const idProofKey = "identityProof";
  static const idProofObjKey = "identityProofObj";
  static const videoResumeKey = "videoResume";
  static const videoResumeObjKey = "videoResumeObj";
  static const languagesKnownKey = "languages";
  static const languagesKnownObjKey = "languagesObj";
  static const youtubeSkillsKey = "skillYoutubes";

  static const _url = "url";
  static const _fileKey = "fileKey";

  factory PersonalInfo.fromJson(Map<String, dynamic> json) {
    return PersonalInfo(
        fullName: json[fullNameKey],
        martialStatus: (json[martialStatusKey] as String).martialStatus,
        gender: (json[genderKey] as String).gender,
        dateOfBirth: (json[dobKey] as String).date,
        country: json[countryObjKey] != null
            ? Country.fromJson(json[countryObjKey])
            : null,
        city: json[cityObjKey] != null ? City.fromJson(json[cityObjKey]) : null,
        pinCode: json[pinCodeKey],
        address: json[addressKey],
        aboutYou: json[aboutYouKey],
        linkedinLink: json[linkedinKey],
        facebookLink: json[facebookKey],
        twitterLink: json[twitterKey],
        instagramLink: json[instagramKey],
        profilePicUrl:
            json[profilePicObjKey] != null ? json[profilePicObjKey][_url] : '',
        profilePicFileKey: json[profilePicObjKey] != null
            ? json[profilePicObjKey][_fileKey]
            : '',
        identityProofUrl:
            json[idProofObjKey] != null ? json[idProofObjKey][_url] : '',
        idProofFileKey:
            json[idProofObjKey] != null ? json[idProofObjKey][_fileKey] : '',
        resumeUrl: json[resumeObjKey] != null ? json[resumeObjKey][_url] : '',
        resumeFileKey:
            json[resumeObjKey] != null ? json[resumeObjKey][_fileKey] : '',
        videoResumeUrl: json[videoResumeObjKey] != null
            ? json[videoResumeObjKey][_url]
            : '',
        videoResumeFileKey: json[videoResumeObjKey] != null
            ? json[videoResumeObjKey][_fileKey]
            : '',
        languages: (json[languagesKnownObjKey] as List<dynamic>)
            .map((e) => Language.fromJson(e))
            .toList(),
        youtubeSkills: (json[youtubeSkillsKey] as List<dynamic>)
            .map((e) => YoutubeSkill.fromJson(e))
            .toList());
  }

  Map<String, dynamic> toJson() {
    return {
      fullNameKey: fullName,
      martialStatusKey: martialStatus.string,
      genderKey: gender.string,
      dobKey: dateOfBirth!.toJson(),
      countryKey: countryId,
      "state": " ",
      cityKey: cityId,
      pinCodeKey: pinCode,
      addressKey: address,
      aboutYouKey: aboutYou,
      linkedinKey: linkedinLink,
      twitterKey: twitterLink,
      facebookKey: facebookLink,
      instagramKey: instagramLink,
      profilePicKey: profilePicFileKey,
      resumeKey: resumeFileKey,
      idProofKey: idProofFileKey,
      videoResumeKey: videoResumeFileKey,
      languagesKnownKey:
          languages.map((e) => (e as Language).toJson()).toList(),
      youtubeSkillsKey: youtubeSkills.map((e) => e.toJson()).toList(),
    };
  }

  void updateCountry(FormEntity? value) {
    if (value != null && value.id != countryId) {
      _resetDependenciesOnCountry();
      country = value;
      notifyListeners();
    }
  }

  void _resetDependenciesOnCountry() {
    _resetCity();
  }

  void _resetCity() {
    city = null;
  }
}

class YoutubeSkill {
  String link;
  String description;

  static const _linkKey = 'link';
  static const _descriptionKey = 'description';

  YoutubeSkill({this.link = '', this.description = ''});

  factory YoutubeSkill.fromJson(Map<String, dynamic> json) => YoutubeSkill(
        link: json[_linkKey] ?? '',
        description: json[_descriptionKey] ?? '',
      );

  Map<String, dynamic> toJson() => {
        "skillId": "",
        _linkKey: link,
        _descriptionKey: description,
      };
}
