enum UploadFileType {
  ProfilePic,
  Resume,
  IdentityProof,
  VideoResume,
}

extension TypeToString on UploadFileType {
  String get string {
    switch (this) {
      case UploadFileType.ProfilePic:
        return 'PROFILEPIC';
      case UploadFileType.Resume:
        return 'RESUME';
      case UploadFileType.IdentityProof:
        return 'IDENTITYPROOF';
      case UploadFileType.VideoResume:
        return 'VIDEORESUME';
    }
  }
}
