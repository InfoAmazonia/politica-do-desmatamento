# A Política do Desmatamento

Quanto dinheiro é gasto pelo governo federal para preservar a Amazônia? Onde os recursos são investidos? Um olhar sobre era moderna do desmatamento aponta os sucessos e as falhas da estratégia oficial de combate à devastação da Amazônia brasileira.

## Installation

### Requirements

- node v6.17.c
- npm v3.10.10

### Build and start server

Install dependencies and build javascript:
```
$ npm install
```

Install napa dependencies
```
$ npm run install
```

Create dist folder and compile project
```
$ npm run predeploy
```

Access [http://localhost:3002/](http://localhost:3002/)

Watch files
```
$ npm run watch
```


### Deploy app to GITHUB PAGES

```
$ npm run deploy
```

OBS: open src/CNAME and change domain if needed

# RUNING WITH DOCKER

Install environment and dependencies
```
$ docker-compose build --no-cache
```

Starting docker
```
$ docker-compose up
```

Install napa dependencies (open docker bash and install)
```
$ docker-compose exec app bash
```
```
docker$ npm run install
```

Create dist folder and compile project (in docker bash)
```
docker$ npm run predeploy
```

Access [http://localhost:3002/](http://localhost:3002/)

### Deploy app to GITHUB PAGES

```
docker$ npm run deploy
```

### NOTES
- If you use 2FA (2 factor authentication) on git hub. [follow these steps](https://medium.com/@ginnyfahs/github-error-authentication-failed-from-command-line-3a545bfd0ca8).
- 
- When using docker you can use watch for save and auto compile files when developing. For this you have to copy dist and node_modules from docker to host and uncomment volumes in docker-compose.yml file the steps are:

1. Copy dist and node_modules from docker to host (when docker-compose is up and running using bash from host)
$ docker cp $(docker-compose ps -q app):/home/node/app/node_modules .
$ docker cp $(docker-compose ps -q app):/home/node/app/dist .

2. Uncomment dist and node_modules folder from .dockerignore file

3. Uncomment Volumes from docker-compose.yml

4. docker-compose down

5. docker-compose up

6. Inside docker bash: docker-compose exec app bash
```
npm run watch
```

### CREDITS
[rafgraph](https://github.com/rafgraph/spa-github-pages) for the 404.html redirect (rewrite rule for github pages). It works!
[Natalie Cardot](https://medium.com/@nataliecardot/easily-deploy-a-create-react-app-project-to-github-pages-280529adb086) how to easily Deploy a Create React App Project to GitHub Pages.
[Ginny Fahs](https://medium.com/@ginnyfahs/github-error-authentication-failed-from-command-line-3a545bfd0ca8) how to authenticate on github with 2FA

