import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _keyUsername = 'github_username';
  static const String _keyRepo = 'github_repo';
  static const String _keyToken = 'github_token';
  static const String _keyAiKey = 'ai_key';
  static const String _keyFolderPass = 'folder_password';

  Future<void> saveSettings({
    required String username,
    required String repo,
    required String token,
    required String aiKey,
    required String folderPass,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUsername, username);
    await prefs.setString(_keyRepo, repo);
    await prefs.setString(_keyToken, token);
    await prefs.setString(_keyAiKey, aiKey);
    await prefs.setString(_keyFolderPass, folderPass);
  }

  Future<Map<String, String>> getSettings() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'username': prefs.getString(_keyUsername) ?? '',
      'repo': prefs.getString(_keyRepo) ?? '',
      'token': prefs.getString(_keyToken) ?? '',
      'aiKey': prefs.getString(_keyAiKey) ?? '',
      'folderPass': prefs.getString(_keyFolderPass) ?? '0000',
    };
  }
}
