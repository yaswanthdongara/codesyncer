import 'dart:convert';
import 'package:http/http.dart' as http;

class AiService {
  final String apiKey;

  AiService({required this.apiKey});

  Future<String> generateCode(String prompt, {bool isChat = false}) async {
    final url = Uri.parse('https://openrouter.ai/api/v1/chat/completions');
    final headers = {
      'Authorization': 'Bearer $apiKey',
      'Content-Type': 'application/json',
      'HTTP-Referer':
          'https://github.com/codesyncer/mobile_app', // Required by OpenRouter for free tier
      'X-Title': 'Code Syncer Mobile', // Optional
    };

    final systemPrompt = isChat
        ? 'You are an expert coding assistant. You can help with coding questions, explain concepts, and write code. Be helpful and concise.'
        : 'You are an expert coding assistant. Provide only the code requested, without markdown formatting or explanations unless asked.';

    final body = json.encode({
      'model': 'mistralai/mistral-7b-instruct:free',
      'messages': [
        {'role': 'system', 'content': systemPrompt},
        {'role': 'user', 'content': prompt},
      ],
    });

    final response = await http.post(url, headers: headers, body: body);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final content = data['choices'][0]['message']['content'].toString();
      final cleanContent = content
          .replaceAll('<s>', '')
          .replaceAll('</s>', '')
          .trim();

      if (cleanContent.isEmpty) {
        return isChat
            ? "I'm sorry, I couldn't generate a response. Please try again."
            : "// No code generated";
      }

      return cleanContent;
    } else {
      throw Exception('Failed to generate code: ${response.body}');
    }
  }
}
