{
  inputs,
  cell,
}: let
  pkgs = inputs.nixpkgs;
in {
  build-changelog = inputs.std.lib.ops.mkOperable {
    package = pkgs.scriv;
    runtimeScript = ''
      VERSION=$(jq ".version" package.json)
      echo "Writting changelog for version $VERSION"
      scriv collect --version "$VERSION"
    '';
    runtimeInputs = [inputs.nixpkgs.jq];
    meta = {
      description = "Makes a changelog release from the changelog.d fragments";
    };
  };
}
