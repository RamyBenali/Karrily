import os
import re

# Regex for emojis and specific symbols requested for removal
# Includes common emoji ranges and the specific symbols matched earlier
emoji_pattern = re.compile(
    "["
    "\U0001F300-\U0001F5FF"  # Misc Symbols and Pictographs
    "\U0001F600-\U0001F64F"  # Emoticons
    "\U0001F680-\U0001F6FF"  # Transport and Map Symbols
    "\U0001F1E0-\U0001F1FF"  # Regional Indicator Symbols
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\u2600-\u26FF"          # Misc Symbols (includes stars, warning, etc.)
    "\u2700-\u27BF"          # Dingbats
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
    "\ufe00-\ufe0f"          # Variation Selectors
    "\u200d"                  # Zero Width Joiner
    "]",
    flags=re.UNICODE
)

def remove_emojis_from_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = emoji_pattern.sub('', content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed emojis from: {filepath}")
            return True
    except Exception as e:
        # Skip binary files or decoding errors
        return False
    return False

def main():
    root_dir = "."

    exclude_dirs = {'.git', 'node_modules', '.gemini', 'dist', 'build'}
    
    modified_count = 0
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            filepath = os.path.join(root, file)
            # Focus on text-based files
            if file.endswith(('.md', '.tsx', '.ts', '.js', '.jsx', '.json', '.html', '.css', '.sql', '.txt', '.toml', '.yml', '.yaml')):
                if remove_emojis_from_file(filepath):
                    modified_count += 1

    print(f"Total files modified: {modified_count}")

if __name__ == "__main__":
    main()
