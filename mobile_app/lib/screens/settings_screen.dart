import 'package:flutter/material.dart';
import '../services/storage_service.dart';
import '../services/github_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _repoController = TextEditingController();
  final TextEditingController _tokenController = TextEditingController();
  final TextEditingController _aiKeyController = TextEditingController();
  final TextEditingController _folderPassController = TextEditingController();
  final StorageService _storageService = StorageService();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final settings = await _storageService.getSettings();
    setState(() {
      _usernameController.text = settings['username']!;
      _repoController.text = settings['repo']!;
      _tokenController.text = settings['token']!;
      _aiKeyController.text = settings['aiKey']!;
      _folderPassController.text = settings['folderPass']!;
    });
  }

  Future<void> _saveSettings() async {
    setState(() => _isLoading = true);
    await _storageService.saveSettings(
      username: _usernameController.text,
      repo: _repoController.text,
      token: _tokenController.text,
      aiKey: _aiKeyController.text,
      folderPass: _folderPassController.text,
    );
    setState(() => _isLoading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Settings saved successfully')),
      );
      Navigator.pop(context);
    }
  }

  Future<void> _createRepo() async {
    if (_usernameController.text.isEmpty ||
        _repoController.text.isEmpty ||
        _tokenController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in GitHub details first')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final githubService = GithubService(
        username: _usernameController.text,
        repo: _repoController.text,
        token: _tokenController.text,
      );
      await githubService.createRepo(
        _repoController.text,
        'Created via Code Syncer App',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Repository created successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Configuration')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('GitHub Configuration'),
                  const SizedBox(height: 15),
                  _buildLabel('GitHub Username'),
                  _buildTextInput(_usernameController, 'e.g. johndoe'),
                  const SizedBox(height: 15),
                  _buildLabel('Repository Name'),
                  Row(
                    children: [
                      Expanded(
                        child: _buildTextInput(
                          _repoController,
                          'e.g. codesyncer',
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: _createRepo,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF161B22),
                          foregroundColor: const Color(0xFFC9D1D9),
                          side: const BorderSide(color: Color(0xFF30363D)),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        child: const Text('Create Repo'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  _buildLabel('GitHub Personal Access Token'),
                  _buildTextInput(
                    _tokenController,
                    'ghp_...',
                    obscureText: true,
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Token is stored locally. Generate a token with \'repo\' scope.',
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),

                  const SizedBox(height: 30),
                  const Divider(color: Color(0xFF30363D)),
                  const SizedBox(height: 20),

                  _buildSectionTitle('AI Configuration'),
                  const SizedBox(height: 15),
                  _buildLabel('OpenRouter API Key (Optional)'),
                  _buildTextInput(
                    _aiKeyController,
                    'sk-or-...',
                    obscureText: true,
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Required for AI code generation. Stored locally.',
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),

                  const SizedBox(height: 30),
                  const Divider(color: Color(0xFF30363D)),
                  const SizedBox(height: 20),

                  _buildSectionTitle('Folder Security'),
                  const SizedBox(height: 15),
                  _buildLabel('Folder Password (Default: 0000)'),
                  Row(
                    children: [
                      Expanded(
                        child: _buildTextInput(
                          _folderPassController,
                          'New Password',
                          obscureText: true,
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF161B22),
                          foregroundColor: const Color(0xFFC9D1D9),
                          side: const BorderSide(color: Color(0xFF30363D)),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        child: const Text('Change'),
                      ),
                    ],
                  ),

                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saveSettings,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF238636),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      child: const Text('Save Configuration'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: Color(0xFF58A6FF),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Text(
        text,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          color: Color(0xFFC9D1D9),
        ),
      ),
    );
  }

  Widget _buildTextInput(
    TextEditingController controller,
    String hint, {
    bool obscureText = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0D1117),
        border: Border.all(color: const Color(0xFF30363D)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        style: const TextStyle(color: Color(0xFFC9D1D9)),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.grey),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 14,
          ),
          border: InputBorder.none,
        ),
      ),
    );
  }
}
