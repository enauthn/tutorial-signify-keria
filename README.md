
## installation

### Download Node.js

https://nodejs.org/en


### get nvm for using node v18.18.2 version

Install nvm on Linux Operating System
Installation on Linux can be done easily in 2 ways (actually, macOS users can install it with brew too, but it's not recommended, I just got scolded for it haha)

1.) Using curl
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```
2.) Using wget
```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```

for windows
https://github.com/coreybutler/nvm-windows/releases

*Important... - DO NOT forget to Restart your terminal OR use command
```
 source ~/.nvm/nvm.sh 
```
(this will refresh the available commands in your system path).


check version using
```
nvm ls
```

show all node.js version for installation
```
nvm ls-remote
```

install node version 18.18.2

```
nvm install v18.18.2
```


## Build with docker

Install dependencies

```
npm install
```

Run agent with docker

```
docker-compose up -d
```

run the signing scripts
```
ts-node index.ts
```

