
# Filtros

Al momento de ejecutar `Select` en una tabla, se hace necesario filtrar los datos.

## Casos en un solo ejemplo

```json
{
    "ID": "ID",
    "Method": "Select",
    "Params": {
        "PK": {
            "ProjectID": 5,
            "Key": ["1.3", "1.3.%"],
            "Level": "Nivel 2"
        }
    }
}
```

`ProjectID` al ser numerico entonces es _exact-match_.
`Key` al ser string entonces posiblmente es _exact-match_ o _match-from-beginning_

La forma de ensamblar las condiciones son: `ProjectID && Key && Level`. Debido a que `Key` es un arreglo de dos valores entonces debe tratarse como `1.3 || 1.3.%` y debido al comodin `*` entonces eso significa _match-from-beginning_.

El ejemplo de arriba entonces resultaria en:
```sql
"ProjectID" = 5 and
("Key" like '1.3' or "Key" like '1,3,%') and
"Level" like 'Nivel 2'
```

La funcion filtrar `f: (Row, Notification) -> Boolean` debe tener en cuenta la presencia de la letra `%` y tornarla en su correspondiente _RegExp_.
