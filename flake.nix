# flake.nix template from the STD Library
{
  description = "Marlowe ts-sdk";

  inputs = {
    std.url = "github:divnix/std";
    nixpkgs.follows = "std/nixpkgs";
    std.inputs.devshell.url = "github:numtide/devshell";
    std.inputs.nixago.url = "github:nix-community/nixago";
  };

  outputs = {
    std,
    self,
    ...
  } @ inputs:
    std.growOn {
      inherit inputs;
      cellsFrom = ./nix;
      cellBlocks = with std.blockTypes; [
        (runnables "scripts")
        (nixago "configs")
        (devshells "shells" {ci.build = true;})
      ];
    }
    {
      devShells = std.harvest self ["ts-sdk" "shells"];
      packages = std.harvest self ["ts-sdk" "packages"];
    };
}
