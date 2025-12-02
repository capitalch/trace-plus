import 'package:equatable/equatable.dart';
import 'package:flutter/cupertino.dart';

class FormEntity extends Equatable {
  final String id;
  final String name;

  FormEntity({
    required this.id,
    required this.name,
  });

  @override
  List<Object?> get props => [id];

  factory FormEntity.fromJson(Map<String, dynamic> json) {
    return FormEntity(
      id: json['id'],
      name: json['name'],
    );
  }

  bool get isOther => name == 'Other';
}

class JobCategory extends FormEntity {
  JobCategory({required String id, required String name})
      : super(id: id, name: name);

  factory JobCategory.fromJson(Map<String, dynamic> json) {
    return JobCategory(
      id: json['id'],
      name: json['name'],
    );
  }
}

class InstitutionType extends FormEntity {
  final String institutionSubTypeLabel;
  InstitutionType({
    required String id,
    required String name,
    required this.institutionSubTypeLabel,
  }) : super(id: id, name: name);

  factory InstitutionType.fromJson(Map<String, dynamic> json) {
    return InstitutionType(
      id: json['id'],
      name: json['name'],
      institutionSubTypeLabel: json['label'] ?? 'Institution Sub Type',
    );
  }
}

class InstitutionSubType extends FormEntity {
  final String institutionMinorTypeLabel;
  InstitutionSubType({
    required String id,
    required String name,
    required this.institutionMinorTypeLabel,
  }) : super(id: id, name: name);

  factory InstitutionSubType.fromJson(Map<String, dynamic> json) {
    return InstitutionSubType(
      id: json['id'],
      name: json['name'],
      institutionMinorTypeLabel: json['label'] ?? 'Institution Minor Type',
    );
  }
}

class InstitutionMinorType extends FormEntity {
  InstitutionMinorType({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory InstitutionMinorType.fromJson(Map<String, dynamic> json) {
    return InstitutionMinorType(
      id: json['id'],
      name: json['name'],
    );
  }
}

class Subject extends FormEntity {
  Subject({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['id'],
      name: json['name'],
    );
  }
}

class Role extends FormEntity {
  Role({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(
      id: json['id'],
      name: json['name'],
    );
  }
}

class EmploymentType extends FormEntity {
  EmploymentType({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory EmploymentType.fromJson(Map<String, dynamic> json) {
    return EmploymentType(
      id: json['id'],
      name: json['type'],
    );
  }
}

class Experience extends FormEntity {
  Experience({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory Experience.fromJson(Map<String, dynamic> json) {
    return Experience(
      id: json['id'],
      name: json['name'],
    );
  }
}

class Country extends FormEntity {
  Country({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory Country.fromJson(Map<String, dynamic> json) {
    return Country(
      id: json['id'],
      name: json['name'],
    );
  }
}

class City extends FormEntity {
  City({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory City.fromJson(Map<String, dynamic> json) {
    return City(
      id: json['id'],
      name: json['name'],
    );
  }
}

class NoticePeriod extends FormEntity {
  NoticePeriod({
    required String id,
    required String name,
  }) : super(id: id, name: name);

  factory NoticePeriod.fromJson(Map<String, dynamic> json) {
    return NoticePeriod(
      id: json['day'],
      name: json['name'],
    );
  }
}

class Language extends FormEntity {
  final LanguageProficiency proficiency;
  final String languageId;

  Language({
    required String id,
    required String name,
    this.languageId = '',
    LanguageProficiency? proficiency,
  })  : this.proficiency = proficiency ?? LanguageProficiency(),
        super(id: id, name: name);

  factory Language.fromJson(Map<String, dynamic> json) {
    return Language(
        id: json['lang_id'],
        name: json['lang_name'],
        languageId: json['languageId'] ?? '',
        proficiency: LanguageProficiency.fromJson(json));
  }

  Map<String, dynamic> toJson() => {
        "languageId": languageId,
        "language": id,
        "languageOther": "",
        ...proficiency.toJson(),
      };

  bool isProficiencySelected() {
    return proficiency.reading || proficiency.writing || proficiency.speaking;
  }
}

class LanguageProficiency with ChangeNotifier {
  bool reading;
  bool writing;
  bool speaking;

  LanguageProficiency({
    this.reading = false,
    this.writing = false,
    this.speaking = false,
  });

  static const _readingKey = 'profReading';
  static const _writingKey = 'profWriting';
  static const _speakingKey = 'profSpeaking';

  static const _one = '1';
  static const _zero = '0';

  factory LanguageProficiency.fromJson(Map<String, dynamic> json) =>
      LanguageProficiency(
        reading: _boolFromDynamic(json[_readingKey]) ?? false,
        writing: _boolFromDynamic(json[_writingKey]) ?? false,
        speaking: _boolFromDynamic(json[_speakingKey]) ?? false,
      );

  Map<String, dynamic> toJson() => {
        _readingKey: _boolToString(reading),
        _writingKey: _boolToString(writing),
        _speakingKey: _boolToString(speaking),
      };

  void toggleReading() {
    reading = !reading;
    notifyListeners();
  }

  void toggleWriting() {
    writing = !writing;
    notifyListeners();
  }

  void toggleSpeaking() {
    speaking = !speaking;
    notifyListeners();
  }

  static bool? _boolFromDynamic(dynamic val) {
    if (val == null) return null;

    if (val.toString() == _one) return true;
    if (val.toString() == _zero) return false;

    throw Exception(
        'Value should be $_one or $_zero for LanguageProficiency\nReceived value from Server $val');
  }

  static String _boolToString(bool isProficient) => isProficient ? _one : _zero;
}
