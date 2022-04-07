    jq
    nodejs
  ];
  shellHook = ''
    export PATH="$PWD/node_modules/.bin/:$PATH"
    alias scripts='jq ".scripts" package.json'
  '';
}
