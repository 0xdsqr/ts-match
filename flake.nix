{
  description = "ts-match - Type-safe pattern matching for TypeScript";
  inputs = {
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-stable.url = "github:NixOS/nixpkgs/release-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs-unstable, nixpkgs-stable, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs-unstable = import nixpkgs-unstable { inherit system; };
        pkgs-stable = import nixpkgs-stable { inherit system; };
        
        ts-match = pkgs-stable.stdenv.mkDerivation {
          pname = "ts-match";
          version = "1.0.0";
          src = ./.;
          
          nativeBuildInputs = with pkgs-stable; [
            typescript
            nodejs
          ] ++ [
            pkgs-unstable.bun
          ];
          
          checkPhase = ''
            # Run tests with coverage
            echo "Running tests with coverage..."
            bun test --coverage
            echo "Tests completed successfully!"
          '';
          
          doCheck = true;
          
          buildPhase = ''
            # Clean dist directory
            rm -rf dist
            
            # Collect all TypeScript source files (excluding tests)
            SOURCE_FILES=$(find src -name "*.ts" -not -name "*.test.ts" | tr '\n' ' ')
            
            # Build with Bun
            bun build $SOURCE_FILES --outdir dist/esm --format esm --target node --external "*" --root src
            
            # Generate TypeScript declarations (exclude test files and examples)
            tsc src/index.ts src/match.ts --outDir dist/types --declaration --emitDeclarationOnly --declarationMap --skipLibCheck
            
            # Copy package.json for npm publishing
            cp package.json dist/
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out/
          '';
        };
        
        examples = pkgs-stable.stdenv.mkDerivation {
          pname = "ts-match-examples";
          version = "1.0.0";
          src = ./.;
          
          nativeBuildInputs = with pkgs-stable; [
            typescript  
            nodejs
          ] ++ [
            pkgs-unstable.bun
          ];
          
          buildPhase = ''
            bun run examples/index.ts
          '';
          
          installPhase = ''
            mkdir -p $out
            echo "Examples completed successfully" > $out/examples.log
          '';
        };

      in {
        packages = {
          default = ts-match;
          ts-match = ts-match;
          examples = examples;
          test = pkgs-stable.stdenv.mkDerivation {
            pname = "ts-match-test";
            version = "1.0.0";
            src = ./.;
            
            nativeBuildInputs = with pkgs-stable; [
              typescript
              nodejs
            ] ++ [
              pkgs-unstable.bun
            ];
            
            buildPhase = ''
              echo "Running ts-match tests with coverage..."
              echo "Files in src directory:"
              ls -la src/*.ts
              echo ""
              bun test --coverage
              echo "Tests completed successfully!"
            '';
            
            installPhase = ''
              mkdir -p $out
              echo "Tests completed with full coverage" > $out/test-results.txt
            '';
          };
        };
        
        apps = {
          default = {
            type = "app";
            program = "${pkgs-stable.writeShellScript "run-examples" ''
              cd ${./.}
              ${pkgs-unstable.bun}/bin/bun run examples/index.ts
            ''}";
          };
          examples = {
            type = "app";
            program = "${pkgs-stable.writeShellScript "run-examples" ''
              cd ${./.}
              ${pkgs-unstable.bun}/bin/bun run examples/index.ts
            ''}";
          };
        };
        
        devShells = {
          default = pkgs-stable.mkShell {
            buildInputs = with pkgs-stable; [
              git
              typescript
              nodejs
            ] ++ [
              pkgs-unstable.bun
            ];
            shellHook = ''
              echo "ts-match dev environment"
            '';
          };
        };
      });
}