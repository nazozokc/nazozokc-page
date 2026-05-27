{
  description = "nazozokc.github.io — portfolio site";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      imports = [
        inputs.treefmt-nix.flakeModule
      ];

      perSystem =
        {
          config,
          self',
          pkgs,
          system,
          ...
        }:
        {
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [ nodejs ];
          };

          apps.dev = {
            type = "app";
            program = "${pkgs.writeShellScriptBin "dev" ''
              exec ${pkgs.nodejs}/bin/npm run dev
            ''}/bin/dev";
            meta.description = "Start SvelteKit development server";
          };

          apps.build = {
            type = "app";
            program = "${pkgs.writeShellScriptBin "build" ''
              exec ${pkgs.nodejs}/bin/npm run build
            ''}/bin/build";
            meta.description = "Build static site for production";
          };

          apps.preview = {
            type = "app";
            program = "${pkgs.writeShellScriptBin "preview" ''
              exec ${pkgs.nodejs}/bin/npm run preview
            ''}/bin/preview";
            meta.description = "Preview production build locally";
          };

          treefmt.config = {
            projectRootFile = "flake.nix";
            programs.nixfmt.enable = true;
          };
        };
    };
}
