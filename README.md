jwks-cloud-cli
==============

JWKS handler on cloud storage

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/jwks-cloud-cli.svg)](https://npmjs.org/package/jwks-cloud-cli)
[![Downloads/week](https://img.shields.io/npm/dw/jwks-cloud-cli.svg)](https://npmjs.org/package/jwks-cloud-cli)
[![License](https://img.shields.io/npm/l/jwks-cloud-cli.svg)](https://github.com/austonpramodh/jwks-cloud-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g jwks-cloud-cli
$ jwks-cloud-cli COMMAND
running command...
$ jwks-cloud-cli (-v|--version|version)
jwks-cloud-cli/0.0.0 win32-x64 node-v14.14.0
$ jwks-cloud-cli --help [COMMAND]
USAGE
  $ jwks-cloud-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`jwks-cloud-cli hello [FILE]`](#jwks-cloud-cli-hello-file)
* [`jwks-cloud-cli help [COMMAND]`](#jwks-cloud-cli-help-command)

## `jwks-cloud-cli hello [FILE]`

describe the command here

```
USAGE
  $ jwks-cloud-cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ jwks-cloud-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/austonpramodh/jwks-cloud-cli/blob/v0.0.0/src/commands/hello.ts)_

## `jwks-cloud-cli help [COMMAND]`

display help for jwks-cloud-cli

```
USAGE
  $ jwks-cloud-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->


## Features
1. Create a new JWKS locally - create local(flag)
   1. Input Params - 
      * filename - name of the file
      * path - cloud storage path
2. Create a new JWKS on cloud - create
3. update JWKS on cloud to add new key
4. delete JWKS on cloud
5. download JWKS