{
  inputs,
  cell,
}: {
  inherit (inputs.nixpkgs) hello;
  default = cell.packages.hello;
}
