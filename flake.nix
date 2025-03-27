{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };
  outputs = { nixpkgs, ... }@inputs:
    let
      inherit (nixpkgs) lib;
      systems = lib.systems.flakeExposed;
      forAllSystems = lib.genAttrs systems;

      mkPkgs = system: nixpkgs.legacyPackages.${system}.pkgs;
    in
    {
      packages = forAllSystems(system: with mkPkgs system; rec {
        default = server;
        server = stdenv.mkDerivation {
          name = "reonic-charging-infra-exmpl";
          src = ./.;
          nativeBuildInputs = [
            nodejs
            pnpm.configHook
          ];
        };
      });
      devShells = forAllSystems(system: with mkPkgs system; rec {
        default = mkShell {
          buildInputs = [
            nodePackages.pnpm
            nodejs
          ];
        };
      });
    };
}