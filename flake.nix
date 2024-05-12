{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        pg-up = pkgs.writeShellScriptBin "pg:start" ''
          pg_ctl start -l $LOG_PATH -o "-c listen_addresses= -c unix_socket_directories=$PGHOST"
        '';
        pg-down = pkgs.writeShellScriptBin "pg:stop" ''
          pg_ctl -D $PGDATA stop
        '';
      in {
        devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            postgresql_16
            pg-up
            pg-down
            nodejs_22
            nodePackages.pnpm
            nodePackages.typescript-language-server
            nodePackages.prettier
          ];
          shellHook = ''
            export PGDATA=$PWD/.postgres/data
            export PGHOST=$PWD/.postgres/postgres
            export LOG_PATH=$PWD/.postgres/LOG
            export PGDATABASE=postgres
            export DATABASE_CLEANER_ALLOW_REMOTE_DATABASE_URL=true

            [ ! -d $PGHOST ] && mkdir -p $PGHOST

            [ ! -d $PGDATA ] && echo 'Initializing postgresql database...' 
            [ ! -d $PGDATA ] && initdb $PGDATA -U postgres --auth=trust >/dev/null
          '';
        };
      });

}
