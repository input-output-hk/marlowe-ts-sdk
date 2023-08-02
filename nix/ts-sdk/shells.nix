{
  inputs,
  cell,
}: let
  inherit (inputs.std) std lib;
  inherit (inputs) nixpkgs;

  # l = nixpkgs.lib // builtins;

  dev = lib.dev.mkShell {
    packages = with nixpkgs; [
      pkg-config
      nodejs
      yarn
    ];

    env = [

    ];

    commands =
      [
        {
          package = nixpkgs.nodejs;
          category = "JavaScript";
        }
        {
          package = nixpkgs.yarn;
          category = "JavaScript";
        }
        {
          package = std.cli.default;
          category = "std";
        }
      ];
  };
in {
  inherit dev;
  default = dev;
}