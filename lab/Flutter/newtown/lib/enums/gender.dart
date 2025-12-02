enum Gender { Male, Female }

const _male = 'Male';
const _female = 'Female';
const _empty = '';

extension GenderToString on Gender {
  String get string {
    switch (this) {
      case Gender.Male:
        return _male;
      case Gender.Female:
        return _female;
    }
  }
}

extension GenderFromString on String {
  Gender get gender {
    switch (this) {
      case _male:
      case _empty:
        return Gender.Male;
      case _female:
        return Gender.Female;
      default:
        throw Exception('Unknown Gender: $this');
    }
  }
}
