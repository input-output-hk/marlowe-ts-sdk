# flake.nix template from the STD Library
{
  description = "Marlowe ts-sdk";

  inputs = {
    std.url = "github:divnix/std";
    nixpkgs.follows = "std/nixpkgs";
    std.inputs.devshell.url = "github:numtide/devshell";
  };

  outputs = { std, self, ...} @ inputs: std.growOn {
    inherit inputs;
    # 1. Each folder inside `cellsFrom` becomes a "Cell"
    #    Run for example: 'mkdir nix/mycell'
    # 2. Each <block>.nix or <block>/default.nix within it becomes a "Cell Block"
    #    Run for example: '$EDITOR nix/mycell/packages.nix' - see example content below
    cellsFrom = ./nix;
    # 3. Only blocks with these names [here: "packages" & "shells"] are picked up by Standard
    #    It's a bit like the output type system of your flake project (hint: CLI & TUI!!)
    cellBlocks = with std.blockTypes; [
      (installables "packages" {ci.build = true;})
      (devshells "shells" {ci.build = true;})
    ];
  }
  # 4. Run 'nix run github:divnix/std'
  # 'growOn' ... Soil:
  #  - here, compat for the Nix CLI
  #  - but can use anything that produces flake outputs (e.g. flake-parts or flake-utils)
  # 5. Run: nix run .
  {
    devShells = std.harvest self ["ts-sdk" "shells"];
    packages = std.harvest self ["ts-sdk" "packages"];
  };
}