## About

**Faraddon** es un simple addon para reportar vulnerabilidades desde el propio browser a tu servidor de faraday. Faraddon se
encarga de capturar los requests que viajan a travez del navegador y provee la opcion de accederlos como si se tratasen de una vulnerabilidad.
De esta manera el pentester no tiene que preocuparse del tedioso proceso de ingresar los datos referentes a una vuln a mano, si no que
puede ir directo al requests vulnerable, crear el issue desde el propio addon y enviarlo a faraday directamente.	

## Compatibility

Por el momento Faraddon solo es compatible con **Firefox Quantum**, pero nos encontramos trabajando
en una version estable para chrome.

## Getting Started!

Para comenzar a usar faraddon una vez instalado, lo primero es iniciar session en faraday

Una vez estemos logueados, nos vamos al icono del addon y clickeamos en la ranura de configuracion sobre la esquina superior derecha.

Solo agregar la url del servidor y dar click en Connect

La url debe tener el siguiente formato: protocol://ip:port

Si todo esta saliendo bien, deberias ver la lista de tus workspaces.

Una vez seleccionado el workspace damos click en save.

Si queremos establecer un scope, para que faraddon solo capture los request de un dominio especifico:

dominio.com

El scope soporta expresiones regulares, por ejemplo, si quisieramos recolectar los requests de todos los subdominios de google

*.google.com


Una vez configurado faraddon, activamos el addon para comenzar a capturar los requests.



## Instalation

```
$ git clone https://majinbuu.infobyte.lan/fedef/faraddon.git

```

* En la barra de busqueda de Firefox escriba **about:debugging**.

* Click en el boton **Load Temporary Add-on**

* Seleccione cualquier fichero dentro del directorio donde ha clonado **Faraddon**.
