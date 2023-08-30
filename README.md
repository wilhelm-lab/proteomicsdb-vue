# ProteomicsDB - Frontend in VueJS

## Development environment with Docker
There is configuration for a fully dockerized development environment included in this
repo. It is strongly recommended to use this environment to ensure an isolated,
consistent and reproducible environment across all platforms and avoid dependency
issues.

### Prerequisites 
You need to have [docker](https://docs.docker.com/get-docker/) 
### Using VSCode (recommended)
If you don't have a strong IDE preference, VSCode is recommended for the easiest setup.  
Install
[VSCode](https://code.visualstudio.com/download)
and then within VSCode the
[Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension. After that open the repo folder in VSCode and it should prompt to *Reopen in Container*
(or type `Ctrl+Shift+P` and search for and execute `>Remote-Containers: Rebuild Container`).  
And now you should already be set!  
On the first run the image has to be build, which might take a while.
If you are using `git` over `ssh` make sure to have an
[SSH-agent](https://www.ssh.com/academy/ssh/agent)
running on your machine which will be automatically forwarded to the devcontainer
by vscode.

### Using another IDE
Build and name the devcontainer:
```bash
docker build --tag proteomicsdb-vue-devcontainer --target dev .
```

Start a bash shell using the devcontainer:
```bash
docker run \
    --interactive --tty \
    --volume $PWD:/workspaces/proteomicsdb-vue \
    --publish 127.0.0.1:8080:8080 \
    proteomicsdb-vue-devcontainer \
    bash
```

Then run `npm install` and `npm run serve` to start the development server. Any `git`
command should also be executed inside the container for git hooks to work properly.
Depending on your setup you might need to forward your SSH agent to the container.

### Windows Users
Docker filesystem mounts don't work well on Windows. To avoid issues, you should use the
[WSL2 backend for Docker Desktop.](https://docs.docker.com/desktop/windows/wsl/)
and keep the repo in the WSL2 filesystem.

## Start development server
To start the development server run (inside the container):
```
npm run serve
```

### Use development backend instead of production:
Specify a different URL for `VUE_APP_API_HOST` in `.env.development.local` and rerun `npm run serve`

# Development FAQ

### You get an error like `Property 'myProperty' does not exist on type 'CombinedVueInstance...`?

You need to annotate the `@return` type of **all** (even if they aren't the ones you get the error on) `computed` properties with [JSDoc](https://jsdoc.app/)-comments like this:
```js
{
    computed: {
        /** @return {any} */
        computedProp() {
            return this.someData
        }
    }
}
```
Try to be specific with the type, e.g. `string`, `number` or something like `{ id: number, text: string }[]` if possible.
`any` works as a catch-all in most cases if you can't figure out the exact type. 
For `get()`-`set()`-style computed props you must set the return and param types of the `get()` and `set()` functions:
```js
{
    computed: {
        computedProp: {
            /** @return {any} */
            get() {
                return this.someData
            }
            /** @param {any} value */
            set(value) {
                this.someData = value
            }
        }
    }
}
```