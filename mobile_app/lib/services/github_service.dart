import 'dart:convert';
import 'package:http/http.dart' as http;

class GithubService {
  final String username;
  final String repo;
  final String token;

  GithubService({
    required this.username,
    required this.repo,
    required this.token,
  });

  Map<String, String> get _headers => {
    'Authorization': 'token $token',
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  Future<List<dynamic>> getContents(String path) async {
    final url = Uri.parse(
      'https://api.github.com/repos/$username/$repo/contents/$path',
    );
    final response = await http.get(url, headers: _headers);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load contents: ${response.statusCode}');
    }
  }

  Future<void> createFile(String path, String content, String message) async {
    final url = Uri.parse(
      'https://api.github.com/repos/$username/$repo/contents/$path',
    );
    final encodedContent = base64.encode(utf8.encode(content));

    final body = json.encode({'message': message, 'content': encodedContent});

    final response = await http.put(url, headers: _headers, body: body);

    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to create file: ${response.body}');
    }
  }

  Future<void> createRepo(String name, String description) async {
    final url = Uri.parse('https://api.github.com/user/repos');
    final body = json.encode({
      'name': name,
      'description': description,
      'private': false,
      'auto_init': true,
    });

    final response = await http.post(url, headers: _headers, body: body);

    if (response.statusCode != 201) {
      throw Exception('Failed to create repository: ${response.body}');
    }
  }
}
