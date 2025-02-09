# AMP HTML ⚡ Validator

A validator for the
[AMP HTML format](https://github.com/ampproject/amphtml/blob/main/README.md).

If you just want to validate a page, please see
[our documentation over at amp.dev](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp).

## Chrome Extension

Please see [js/chromeextension/README.md](https://github.com/ampproject/amphtml/blob/main/validator/js/chromeextension/README.md).

## Visual Studio Code Extension

An extension for Visual Studio Code
[VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=amphtml.amphtml-validator)

## Command Line Tool and Node.js API

Please see [js/nodejs/README.md](https://github.com/ampproject/amphtml/blob/main/validator/js/nodejs/README.md).

## Web UI

Please see [js/webui/README.md](https://github.com/ampproject/amphtml/blob/main/validator/js/webui/README.md).

## JSON

The validator rules are exported in the JSON format and hosted on: `https://cdn.ampproject.org/v0/validator.json`

The JSON rules are provided on best-effort basis and it's not recommended to
rely on them in a production environment.

## Building a Custom Validator

This is only useful for development - e.g. when making changes to
`js/engine/validator.js` or when authoring an AMP extension, and it's rough
around the edges. Below are instructions for Linux Ubuntu 14.

## Installation

### Linux

Install these packages using apt-get:

-   `npm`
-   `default-jdk`
-   `protobuf-compiler`
-   `python3`
-   `python3-pip`

Then `pip3 install protobuf`.

In addition, install Node.js v4.4.2. E.g.,
[by downloading](https://nodejs.org/en/download/) or
[by using a package manager](https://nodejs.org/en/download/package-manager/) or
[by using NVM](https://github.com/creationix/nvm).

### OSX

Dependencies:

-   npm
-   [homebrew](https://brew.sh/)
-   python 3 (e.g. [these instructions](https://docs.python-guide.org/starting/install3/osx/))

    -   protobuf

        ```sh
        pip3 install --user protobuf
        ```

    -   openjdk-7-jre

        Install openjdk, then symlink the system Java wrappers to find it:

        ```sh
        brew install openjdk
        sudo ln -sfn /usr/local/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
        ```

### Usage

Then, run `python build.py`. This creates `dist/validator_minified.js`, which is
equivalent to the validator deployed at cdn.ampproject.org. You may now
use the `--validator_js` command line flag to
[amphtml-validator](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp#command-line-tool) to use this validator.

For use for testing with extensions, you can simply run `python build.py`
to run all of the validator tests in the amphtml repo.
To create/update `validator-*.out` files that are used in the test,
run `python build.py --update_tests`.

```sh
$ amphtml-validator --validator_js dist/validator_minified.js testdata/feature_tests/several_errors.html
testdata/feature_tests/several_errors.html:23:2 The attribute 'charset' may not appear in tag 'meta name= and content='.
testdata/feature_tests/several_errors.html:26:2 The tag 'script' is disallowed except in specific forms.
testdata/feature_tests/several_errors.html:32:2 The mandatory attribute 'height' is missing in tag 'amp-img'. (see https://amp.dev/documentation/components/amp-img)
testdata/feature_tests/several_errors.html:34:2 The attribute 'width' in tag 'amp-ad' is set to the invalid value '100%'. (see https://amp.dev/documentation/components/amp-ad)
...
```

### Building on MacOS

_Note: This is for building the validator from source. If you are simply running validator tests for extensions, see the Installation steps instead._

-   Download protobuf with `brew install protobuf` via [homebrew](https://brew.sh/).
-   Use pip to `pip install google` and `pip install protobuf`. If you don't have pip, you can get it either via `brew install python` or [get-pip.py](https://bootstrap.pypa.io/get-pip.py).
-   If your [npm](https://www.npmjs.com/) is out of date, run `npm i -g npm` to update it.

To verify that you have the necessary prerequisites, run and verify:

```sh
$ protoc --version
libprotoc 3.5.1
```

and

```sh
$ python
>>> import google.protobuf
>>>
```

Now `cd amphtml/validator` and run `python build.py`.

### Locally Reproduce Validator Tests of Circle CI workflow

In the case the test passes in your local machine but fails in Circle CI,
you can use docker to reproduce the test errors.

1. Start an interactive docker container
    ```bash
    docker run -it node:lts-buster bash
    ```
1. Run following commands in the container. Note that you are already the `root` user inside the docker container.
    ```bash
    apt update
    apt install -y sudo
    git clone https://github.com/ampproject/amphtml.git
    cd amphtml
    npm install
    npm run postinstall
    .circleci/install_validator_dependencies.sh
    amp validator-cpp && echo SUCCESS || echo FAIL
    ```
1. To see more information of the tests
    ```bash
    sed -i 's/--test_output=errors//' build-system/tasks/validator.js
    sed -i 's/--ui_event_filters=INFO//' build-system/tasks/validator.js
    ```
    Then re-run `amp validator-cpp && echo SUCCESS || echo FAIL`.
