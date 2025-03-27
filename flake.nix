{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
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
        server = stdenv.mkDerivation (finalAttrs: rec {
          name = "reonic-charging-infra-exmpl";
          pname = name;
          version = "0.0.1";
          src = ./.;
          nativeBuildInputs = [
            nodejs
            pnpm.configHook
          ];

          pnpmDeps = pnpm.fetchDeps {
            inherit (finalAttrs) pname version src;
            hash = "";
          };
        });
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