{
  description = "Kp-Music Discord Bot - Production Ready";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        # Development environment
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            ffmpeg
            yt-dlp
            git
            curl
            wget
          ];
          
          shellHook = ''
            echo "🎵 Kp-Music Bot Environment Ready"
            export PATH=${pkgs.nodejs_20}/bin:${pkgs.ffmpeg}/bin:${pkgs.yt-dlp}/bin:$PATH
          '';
        };

        # Production package
        packages.default = pkgs.buildNpmPackage {
          name = "kp-music-bot";
          version = "4.1.0";
          src = ./.;

          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

          buildInputs = with pkgs; [
            ffmpeg
            yt-dlp
          ];

          installPhase = ''
            mkdir -p $out
            cp -r . $out/
            cp -r node_modules $out/
          '';

          postInstall = ''
            chmod +x $out/launcher.js
          '';
        };

        # Docker image
        packages.docker = pkgs.dockerTools.buildImage {
          name = "kp-music-bot";
          tag = "latest";
          fromImage = pkgs.dockerTools.pullImage {
            imageName = "node";
            imageDigest = "sha256:1234567890abcdef"; # Update with actual digest
            sha256 = "";
            os = "linux";
            arch = "x86_64";
          };

          copyToRoot = pkgs.buildEnv {
            name = "image-root";
            paths = with pkgs; [
              ffmpeg
              yt-dlp
              self.packages.${system}.default
            ];
            pathsToLink = [ "/app" "/bin" ];
          };

          config = {
            Cmd = [ "${pkgs.nodejs_20}/bin/node" "/app/launcher.js" ];
            WorkingDir = "/app";
          };
        };

        # Apps
        apps.dev = {
          type = "app";
          program = "${pkgs.writeShellScript "dev" ''
            ${pkgs.nodejs_20}/bin/npm run dev
          ''}/bin/dev";
        };

        apps.start = {
          type = "app";
          program = "${pkgs.writeShellScript "start" ''
            ${pkgs.nodejs_20}/bin/npm start
          ''}/bin/start";
        };
      }
    );
}
