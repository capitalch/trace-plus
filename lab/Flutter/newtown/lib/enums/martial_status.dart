enum MartialStatus { Single, Married }

const _married = 'Married';
const _single = 'Single';
const _empty = '';

extension MartialStatusToString on MartialStatus {
  String get string {
    switch (this) {
      case MartialStatus.Single:
        return _single;
      case MartialStatus.Married:
        return _married;
    }
  }
}

extension MartialStatusFromString on String {
  MartialStatus get martialStatus {
    switch (this) {
      case _single:
      case _empty:
        return MartialStatus.Single;
      case _married:
        return MartialStatus.Married;
      default:
        throw Exception('Unknown MartialStatus: $this');
    }
  }
}
