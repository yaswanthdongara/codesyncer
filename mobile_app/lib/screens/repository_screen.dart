import 'package:flutter/material.dart';
import '../services/github_service.dart';
import '../services/storage_service.dart';

class RepositoryScreen extends StatefulWidget {
  const RepositoryScreen({super.key});

  @override
  State<RepositoryScreen> createState() => _RepositoryScreenState();
}

class _RepositoryScreenState extends State<RepositoryScreen> {
  bool _isGridView = false;
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _files = [];
  bool _isLoading = false;
  String _currentPath = '';
  final StorageService _storageService = StorageService();

  @override
  void initState() {
    super.initState();
    _loadFiles();
  }

  Future<void> _loadFiles() async {
    setState(() => _isLoading = true);
    try {
      final settings = await _storageService.getSettings();
      if (settings['username']!.isEmpty ||
          settings['repo']!.isEmpty ||
          settings['token']!.isEmpty) {
        setState(() => _isLoading = false);
        return;
      }

      final githubService = GithubService(
        username: settings['username']!,
        repo: settings['repo']!,
        token: settings['token']!,
      );

      final files = await githubService.getContents(_currentPath);
      setState(() {
        _files = files;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading files: $e')));
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Repository'),
        actions: [
          IconButton(
            icon: Icon(_isGridView ? Icons.list : Icons.grid_view),
            onPressed: () {
              setState(() {
                _isGridView = !_isGridView;
              });
            },
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadFiles),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF0D1117),
                border: Border.all(color: const Color(0xFF30363D)),
                borderRadius: BorderRadius.circular(6),
              ),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: Color(0xFFC9D1D9)),
                decoration: const InputDecoration(
                  hintText: '🔍 Search files...',
                  hintStyle: TextStyle(color: Colors.grey),
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 14,
                  ),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),

          // Breadcrumb
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              children: [
                const Icon(
                  Icons.folder_open,
                  size: 16,
                  color: Color(0xFF58A6FF),
                ),
                const SizedBox(width: 8),
                Text(
                  'root / $_currentPath',
                  style: TextStyle(
                    fontFamily: 'Courier New',
                    color: Theme.of(context).primaryColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // File List/Grid
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _files.isEmpty
                ? const Center(child: Text('No files found or not configured'))
                : (_isGridView ? _buildGridView() : _buildListView()),
          ),
        ],
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'folder',
            onPressed: () {},
            backgroundColor: const Color(0xFF161B22),
            mini: true,
            child: const Icon(
              Icons.create_new_folder,
              color: Color(0xFF58A6FF),
            ),
          ),
          const SizedBox(width: 10),
          FloatingActionButton(
            heroTag: 'file',
            onPressed: () {},
            backgroundColor: const Color(0xFF238636),
            child: const Icon(Icons.note_add, color: Colors.white),
          ),
        ],
      ),
    );
  }

  Widget _buildListView() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _files.length,
      itemBuilder: (context, index) {
        final file = _files[index];
        final isDir = file['type'] == 'dir';
        return InkWell(
          onTap: () {
            if (isDir) {
              setState(() {
                _currentPath = file['path'];
              });
              _loadFiles();
            }
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border.all(color: const Color(0xFF30363D)),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              children: [
                Icon(
                  isDir ? Icons.folder : Icons.description,
                  color: isDir ? const Color(0xFF58A6FF) : Colors.grey,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        file['name'],
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isDir
                              ? const Color(0xFF58A6FF)
                              : const Color(0xFFC9D1D9),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildGridView() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4, // Increased to 4 to make icons smaller
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.0,
      ),
      itemCount: _files.length,
      itemBuilder: (context, index) {
        final file = _files[index];
        final isDir = file['type'] == 'dir';
        return InkWell(
          onTap: () {
            if (isDir) {
              setState(() {
                _currentPath = file['path'];
              });
              _loadFiles();
            }
          },
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border.all(color: const Color(0xFF30363D)),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  isDir ? Icons.folder : Icons.description,
                  size: 24, // Reduced size
                  color: isDir ? const Color(0xFF58A6FF) : Colors.grey,
                ),
                const SizedBox(height: 8),
                Text(
                  file['name'],
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isDir
                        ? const Color(0xFF58A6FF)
                        : const Color(0xFFC9D1D9),
                  ),
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
