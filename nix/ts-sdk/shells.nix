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
      scriv
      nodePackages.prettier
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
    ];
  };
in {
  inherit dev;
  default = dev;
}
