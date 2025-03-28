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
        default = prod;
        prod = stdenv.mkDerivation (finalAttrs: rec {
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
            hash = "sha256-EobgqRnLJ/KQQw1A8XmQw5volBBlXYpRT5vGT6ggKts=";
          };

           buildPhase = ''
            pnpm install
            pnpm build
          '';

          installPhase = ''
            mkdir -p $out/bin
            cp -r .svelte-kit/output $out/dist
            touch $out/bin/${name}
            chmod +x $out/bin/${name}
            echo "#!${bash}/bin/bash" > $out/bin/${name}
            echo "cd $out" >> $out/bin/${name}
            echo "${pnpm}/bin/pnpx vite preview --host" >> $out/bin/${name}
          '';
        });
      });
      devShells = forAllSystems(system: with mkPkgs system; {
        default = mkShell {
          buildInputs = [
            nodePackages.pnpm
            nodejs
          ];
        };
      });
    };
}