import 'package:flutter/material.dart';
import 'settings_screen.dart';
import '../services/github_service.dart';
import '../services/ai_service.dart';
import '../services/storage_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedLanguage = 'python';
  final TextEditingController _codeController = TextEditingController();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final StorageService _storageService = StorageService();
  bool _isLoading = false;

  final List<Map<String, String>> _languages = [
    {'value': 'python', 'label': 'Python', 'icon': '🐍'},
    {'value': 'java', 'label': 'Java', 'icon': '☕'},
    {'value': 'javascript', 'label': 'JavaScript', 'icon': '📜'},
    {'value': 'cpp', 'label': 'C++', 'icon': '➕'},
    {'value': 'csharp', 'label': 'C#', 'icon': '#️⃣'},
    {'value': 'go', 'label': 'Go', 'icon': '🐹'},
    {'value': 'rust', 'label': 'Rust', 'icon': '🦀'},
    {'value': 'html', 'label': 'HTML', 'icon': '🌐'},
    {'value': 'css', 'label': 'CSS', 'icon': '🎨'},
    {'value': 'other', 'label': 'Other', 'icon': '📝'},
  ];

  Future<void> _submitCode() async {
    if (_titleController.text.isEmpty || _codeController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a title and code')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final settings = await _storageService.getSettings();
      if (settings['username']!.isEmpty ||
          settings['repo']!.isEmpty ||
          settings['token']!.isEmpty) {
        throw Exception('GitHub settings not configured');
      }

      final githubService = GithubService(
        username: settings['username']!,
        repo: settings['repo']!,
        token: settings['token']!,
      );

      // Simple folder structure based on language
      final path = '$_selectedLanguage/${_titleController.text}';

      await githubService.createFile(
        path,
        _codeController.text,
        _descController.text.isEmpty
            ? 'Added via Code Syncer App'
            : _descController.text,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Code submitted successfully!')),
        );
      }
      _codeController.clear();
      _titleController.clear();
      _descController.clear();
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

  Future<void> _generateCode() async {
    if (_descController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a description for AI generation'),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final settings = await _storageService.getSettings();
      if (settings['aiKey']!.isEmpty) {
        throw Exception('AI API Key not configured');
      }

      final aiService = AiService(apiKey: settings['aiKey']!);
      final code = await aiService.generateCode(
        'Write $_selectedLanguage code for: ${_descController.text}',
      );

      setState(() {
        _codeController.text = code;
      });
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
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.terminal, color: Colors.green),
            const SizedBox(width: 10),
            const Text('Code Syncer'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Controls Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // Language Selector
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              height: 48,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0D1117),
                                border: Border.all(
                                  color: const Color(0xFF30363D),
                                ),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _selectedLanguage,
                                  isExpanded: true,
                                  dropdownColor: const Color(0xFF161B22),
                                  style: const TextStyle(
                                    color: Color(0xFFC9D1D9),
                                  ),
                                  items: _languages.map((lang) {
                                    return DropdownMenuItem(
                                      value: lang['value'],
                                      child: Row(
                                        children: [
                                          Text(lang['icon']!),
                                          const SizedBox(width: 8),
                                          Text(lang['label']!),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedLanguage = value!;
                                    });
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      // AI Generate Button
                      ElevatedButton.icon(
                        onPressed: _generateCode,
                        icon: const Icon(Icons.auto_awesome, size: 18),
                        label: const Text('AI Generate'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF161B22),
                          foregroundColor: const Color(0xFF58A6FF),
                          side: const BorderSide(color: Color(0xFF58A6FF)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                          minimumSize: const Size(0, 48),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),

                  // Filename Input
                  _buildLabel('Filename / Title'),
                  _buildTextInput(_titleController, 'Title or filename...'),
                  const SizedBox(height: 15),

                  // Code Editor
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildLabel('Code Input'),
                      IconButton(
                        icon: const Icon(
                          Icons.fullscreen,
                          size: 20,
                          color: Colors.grey,
                        ),
                        onPressed: () {},
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  Container(
                    height: 300,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D1117),
                      border: Border.all(color: const Color(0xFF30363D)),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: TextField(
                      controller: _codeController,
                      maxLines: null,
                      expands: true,
                      style: const TextStyle(
                        fontFamily: 'Courier New',
                        fontSize: 14,
                        color: Color(0xFFC9D1D9),
                      ),
                      decoration: const InputDecoration(
                        hintText: '// Write your code here...',
                        hintStyle: TextStyle(color: Colors.grey),
                        contentPadding: EdgeInsets.all(12),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),

                  // Description
                  _buildLabel('Description'),
                  Container(
                    height: 80,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D1117),
                      border: Border.all(color: const Color(0xFF30363D)),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: TextField(
                      controller: _descController,
                      maxLines: null,
                      expands: true,
                      style: const TextStyle(color: Color(0xFFC9D1D9)),
                      decoration: const InputDecoration(
                        hintText: 'Add comments...',
                        hintStyle: TextStyle(color: Colors.grey),
                        contentPadding: EdgeInsets.all(12),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),

                  // Password
                  _buildLabel('🔒 Password Protection (Optional)'),
                  _buildTextInput(
                    _passwordController,
                    'Enter password to encrypt...',
                    obscureText: true,
                  ),
                  const SizedBox(height: 20),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _submitCode,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF238636),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          child: const Text('Submit Code'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            _codeController.clear();
                            _titleController.clear();
                            _descController.clear();
                            _passwordController.clear();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF161B22),
                            foregroundColor: const Color(0xFFC9D1D9),
                            side: const BorderSide(color: Color(0xFF30363D)),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          child: const Text('Clear'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
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
