# Tool icon PNG bundle (`png-512/`)

Icons in `png-512/` are sourced from [TechIcons](https://techicons.dev/) (426 PNG icons, 512px).

## License

TechIcons distributes technology brand icons that are primarily derived from the
[Simple Icons](https://github.com/simple-icons/simple-icons) project, which is
released under **CC0 1.0 Universal** (public domain dedication). No attribution
is legally required for CC0 works, but you must still respect **third-party
trademarks** — logos remain the property of their respective owners.

- Simple Icons license: https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md  
- TechIcons site: https://techicons.dev/

## Usage in this project

Bundled PNGs are used as the **first automatic fallback** for tool logos (after a
user-uploaded `iconUrl`). If no local PNG matches a tool name, the app falls back
to the in-app Simple Icons React library, then to a letter mark.

## Regenerating the lookup manifest

After adding or replacing PNG files:

```bash
npm run generate:tool-icons
```

The manifest uses **exact token matching** (v2): tool names are normalized and split into words (`ChatGPT` → `chatgpt`, `chat`, `gpt`). Short filename fragments like `hat` from `Red-Hat.png` are not indexed, which avoids false matches (e.g. `chatgpt` → Red Hat).
