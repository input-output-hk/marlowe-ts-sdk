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
  test-spec = inputs.std.lib.ops.mkOperable {
    package = inputs.nixpkgs.nodejs;
    runtimeScript = ''
      node packages/language/spec-cli/dist/esm/main.js
    '';
    runtimeInputs = [];
    meta = {
      description = "Runs the Marlowe Spec test suite";
    };
  };
}
