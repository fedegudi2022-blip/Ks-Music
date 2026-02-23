{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js runtime
    nodejs_20

    # Audio/Video processing
    ffmpeg
    
    # YouTube downloader
    yt-dlp
    
    # Additional utilities
    git
    curl
    wget
    
    # Process management (for development)
    tmux
  ];

  shellHook = ''
    echo "🎵 Kp-Music Bot Development Environment"
    echo "========================================"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "FFmpeg: $(ffmpeg -version | head -n1)"
    echo "yt-dlp: $(yt-dlp --version)"
    echo ""
    echo "Run 'npm install' to get started"
    echo "Run 'npm start' to launch the bot"
    echo ""
  '';
}
