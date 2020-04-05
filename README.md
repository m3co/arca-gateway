# ARCA Proxy (nodeJS)

Lo que me interesa de este proxy es que nodeJS tiene una biblioteca excelentisima llamada [Socket.io](https://github.com/socketio/socket.io) y, bueno...

## Como usar?

```sh
npm install;
npm run server; # primer terminal
npm run show; # segundo terminal - opcional
```

Renombrar `example.config.ini` por `config.ini` indicando los valores correspondientes.
```sh

port = 8085                     # gateway

[static]
target = http://localhost:8080  # la pagina - e.g. arca-demo

[facad]                         # de uso interno, no poner cuidado
port = 22346
host = x2.m3c.space

[arca]                          # la direccion del servidor en GO
port = 22345
host = localhost
```

## Las pruebas

- `npm run start-go-server` es para correr el contenedor con el servidor de prueba
- `npm start` es donde pienso poner a correr el entorno de desarrollo
- `npm test` ya funciona y muestra al menos una primera prueba sencilla
