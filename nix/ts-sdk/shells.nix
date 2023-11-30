{
  inputs,
  cell,
}: let
  inherit (inputs.std) std lib;
  inherit (inputs) nixpkgs;

  # l = nixpkgs.lib // builtins;

  dev = lib.dev.mkShell {
    name = "ts-sdk devshell";
    packages = with nixpkgs; [
      pkg-config
      nodejs
      deno
      scriv
      nodePackages.prettier
      inputs.marloweSpec.packages."marlowe-spec-test:exe:marlowe-spec"
    ];
    nixago = [
      ((lib.dev.mkNixago lib.cfg.treefmt) cell.configs.treefmt)
      ((lib.dev.mkNixago lib.cfg.editorconfig) cell.configs.editorconfig)
      ((lib.dev.mkNixago lib.cfg.lefthook) cell.configs.lefthook)
    ];

    commands = [
      {
        package = nixpkgs.nodejs;
        category = "JavaScript";
      }
      {
        package = nixpkgs.nodePackages.prettier;
        category = "JavaScript";
      }
      {
        package = std.cli.default;
        category = "general commands";
      }
      {
        command = ''
          marlowe-spec -c ${cell.scripts.test-spec}/bin/operable-nodejs
        '';
        name = "test-spec";
        category = "Tests";
        help = "Runs the Marlowe Spec test suite";
      }
    ];
  };
in {
  inherit dev;
  default = dev;
}
